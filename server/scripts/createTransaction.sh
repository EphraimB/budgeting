#!/bin/sh

unique_id=$1
account_id=$2
id=$3
transaction_amount=$4
transaction_title=$5
transaction_description=$6

# Fetch the employee IDs from the database using psql and environment variables
createTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ('$account_id', '$transaction_amount', '$transaction_title', '$transaction_description')" -t)

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
        # Decrement the loan_amount in the loans table
        decrementLoanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount - '$transaction_amount' WHERE loan_id = '$id'" -t)

        # Log if the loan_amount was successfully decremented
        if [ $? -eq 0 ]; then
            echo "Loan amount successfully decremented for id $id"
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
