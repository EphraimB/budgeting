#!/bin/sh

unique_id=$1
account_id=$2
id=$3
transaction_amount=$4
transaction_title=$5
transaction_description=$6

# Get transaction_type from the prefixed unique_id
transaction_type=$(echo "${unique_id}" | cut -d '_' -f 1)

if [ "$transaction_type" = "payroll" ]; then
    transaction_tax_rate=$8
elif [ "$transaction_type" = "loan" ]; then
    transaction_tax_rate=0
else
    # Get the tax_id for other transaction types
    tax_id=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c "SELECT tax_id FROM ${transaction_type}s WHERE ${transaction_type}_id = '$id'")
    if [ $? -eq 0 ]; then
        echo "Tax ID successfully fetched for id $id"
        # Get the tax percentage from the database by tax_id
        transaction_tax_rate=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c "SELECT tax_rate FROM taxes WHERE tax_id = '$tax_id'")

        # If transaction_tax_rate is null or empty, set it to 0
        if [ -z "$transaction_tax_rate" ]; then
            transaction_tax_rate=0
        fi
    fi
fi

# Fetch the employee IDs from the database using psql and environment variables
createTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES ('$account_id', '$transaction_amount', '$transaction_tax_rate', '$transaction_title', '$transaction_description')" -t)

# Log if the first transaction was successful
if [ $? -eq 0 ]; then
    echo "Transaction successfully created for account_id $account_id"

    # Check if destination_account_id is provided as the sixth argument
    if [ $# -eq 7 ]; then
        destination_account_id=$7

        # Execute the second psql query for the destination_account_id
        createDestinationTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ('$destination_account_id', ABS('$transaction_amount'), '$transaction_title', '$transaction_description')" -t)

        # Log if the second transaction was successful
        if [ $? -eq 0 ]; then
            echo "Transaction successfully created for destination_account_id $destination_account_id"
        else
            echo "Transaction creation failed for destination_account_id $destination_account_id"
        fi
    fi

    # Check if the unique_id is prefixed with "loan_"
    if echo "${unique_id}" | grep -q "^loan_"; then
        transaction_amount_abs=$(($transaction_amount * -1))
        # Decrement the loan_amount in the loans table
        decrementLoanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount - '$transaction_amount_abs' WHERE loan_id = '$id'" -t)

        # Log if the loan_amount was successfully decremented
        if [ $? -eq 0 ]; then
            echo "Loan amount successfully decremented for id $id"

            loanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT loan_amount FROM loans WHERE loan_id = '$id'" -t)

            # If loan_amount is less than transaction_amount, update loan_plan_amount to loan_amount
            if [ $(echo "$loanAmount < $transaction_amount_abs" | bc -l) -eq 1 ]; then
                updateLoanPlanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_plan_amount = loan_amount WHERE loan_id = '$id' AND loan_amount < loan_plan_amount" -t)

                # Update the crontab to reflect the new loan_plan_amount
                if [ $? -eq 0 ]; then
                    echo "Loan plan amount successfully updated for id $id"
                    (crontab -l | grep -v "/app/dist/scripts/createTransaction.sh ${unique_id}" || true) | crontab -
                    (
                        crontab -l
                        echo "0 0 * * * /app/dist/scripts/createTransaction.sh ${unique_id} ${account_id} ${id} ${loanAmount} \"${transaction_title}\" \"${transaction_description}\" > /app/cron.log 2>&1"
                    ) | crontab -
                else
                    echo "Loan plan amount update failed for id $id"
                fi
            fi

            getLoanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT loan_amount FROM loans WHERE loan_id = '$id'" -t)

            # Log if the loan_amount was successfully fetched
            if [ $? -eq 0 ]; then
                echo "Loan amount successfully fetched for id $id"

                # Check if the loan_amount is less than or equal to 0
                if [ $(echo "$getLoanAmount <= 0" | bc -l) -eq 1 ]; then
                    # If so, remove the existing cron job for this unique id and the loan from the database
                    getCronJob=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT cron_job_id FROM loans WHERE loan_id = '$id'" -t)

                    # Log if the cron job was successfully fetched
                    if [ $? -eq 0 ]; then
                        echo "Cron job successfully fetched for id $id"
                        echo "Cron Job ID: $getCronJob"

                        getInterestCronJobId=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT interest_cron_job_id FROM loans WHERE loan_id = '$id'" -t)
                        getInterestCronJobUniqueId=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT unique_id FROM cron_jobs WHERE cron_job_id = '$getInterestCronJobId'" -t)

                        deleteLoan=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM loans WHERE loan_id = '$id'" -t)
                        deleteCronJob=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getCronJob'" -t)
                        deleteInterestCronJob=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getInterestCronJobId'" -t)

                        (crontab -l | grep -v "/app/dist/scripts/createTransaction.sh ${unique_id}" || true) | crontab -
                        (crontab -l | grep -v "${getInterestCronJobUniqueId}" || true) | crontab -

                        # Log if the loan was successfully deleted
                        if [ $? -eq 0 ]; then
                            echo "Loan successfully deleted for id $id"
                        else
                            echo "Loan deletion failed for id $id"
                        fi
                    else
                        echo "Cron job fetch failed for id $id"
                    fi
                fi
            else
                echo "Loan amount fetch failed for id $id"
            fi
        else
            echo "Loan amount decrement failed for id $id"
        fi
    fi

    # Check if the unique_id is prefixed with "wishlist_"
    if echo "${unique_id}" | grep -q "^wishlist_"; then
        # If so, remove the existing cron job for this unique id and the wishlist from the database
        getWishlists=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT cron_job_id FROM wishlist WHERE wishlist_id = '$id'" -t)

        # Log if the wishlist was successfully fetched
        if [ $? -eq 0 ]; then
            echo "Wishlist successfully fetched for id $id"
            echo "Cron Job ID: $getWishlists"

            deleteWishlist=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM wishlist WHERE wishlist_id = '$id'" -t)
            deleteCronJob=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getWishlists'" -t)

            (crontab -l | grep -v "/app/dist/scripts/createTransaction.sh ${unique_id}" || true) | crontab -

            # Log if the wishlist was successfully deleted
            if [ $? -eq 0 ]; then
                echo "Wishlist successfully deleted for id $id"
            else
                echo "Wishlist deletion failed for id $id"
            fi
        else
            echo "Wishlist fetch failed for id $id"
        fi
    fi
else
    echo "Transaction creation failed for account_id $account_id"
fi
