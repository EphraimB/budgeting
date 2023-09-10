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
elif [ "$transaction_type" = "loan" ] || [ "$transaction_type" = "income" ] || [ "$transaction_type" = "commute" ]; then
    transaction_tax_rate=0
else
    # Get the tax_id for other transaction types
    if [ "$transaction_type" = "income" ]; then
        tax_id=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c "SELECT tax_id FROM income WHERE income_id = '$id'")
    else
        tax_id=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c "SELECT tax_id FROM ${transaction_type}s WHERE ${transaction_type}_id = '$id'")
    fi
    # Capture the exit status immediately after executing the command
    cmd_status=$?

    if [ $cmd_status -eq 0 ]; then
        echo "Tax ID successfully fetched for id $id"
        # Get the tax percentage from the database by tax_id
        transaction_tax_rate=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c "SELECT tax_rate FROM taxes WHERE tax_id = '$tax_id'")

        # If transaction_tax_rate is null or empty, set it to 0
        if [ -z "$transaction_tax_rate" ]; then
            transaction_tax_rate=0
        fi
    fi
fi

if [ "$transaction_type" = "commute" ]; then
    commute_system = $(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -t -c SELECT commute_schedule_id, commute_systems.commute_system_id, commute_schedule.commute_ticket_id AS commute_ticket_id, commute_schedule.day_of_week AS day_of_week, commute_schedule.start_time AS start_time, commute_systems.name AS commute_system, fare_details.name AS fare_type, commute_schedule.date_created, commute_schedule.date_modified FROM commute_schedule LEFT JOIN commute_tickets ON commute_schedule.commute_ticket_id = commute_tickets.commute_ticket_id LEFT JOIN fare_details ON commute_tickets.fare_detail_id = fare_details.fare_detail_id LEFT JOIN commute_systems ON fare_details.commute_system_id = commute_systems.commute_system_id WHERE commute_schedule.commute_schedule_id = '$id'")

    day_of_week=$(echo "$commute_system" | awk -F'\t' '{print $4}')
    start_time=$(echo "$commute_system" | awk -F'\t' '{print $5}')
    commute_system_name=$(echo "$commute_system" | awk -F'\t' '{print $6}')
    fare_type=$(echo "$commute_system" | awk -F'\t' '{print $7}')

    # Get current day of week (0 for Sunday, 1 for Monday, etc.)
    current_day=$(date +%u)

    # Convert day_of_week string to a number
    case $day_of_week in
        Sunday)    target_day=0 ;;
        Monday)    target_day=1 ;;
        Tuesday)   target_day=2 ;;
        Wednesday) target_day=3 ;;
        Thursday)  target_day=4 ;;
        Friday)    target_day=5 ;;
        Saturday)  target_day=6 ;;
    esac

    # Calculate difference in days
    if (( target_day > current_day )); then
        day_diff=$(( target_day - current_day ))
    else
        day_diff=$(( 7 - current_day + target_day ))
    fi

    # Generate the timestamp
    next_timestamp=$(date -d "$day_diff days $start_time" +"%Y-%m-%d %H:%M:%S")

    echo "Next timestamp: $next_timestamp"

    # Capture the exit status immediately after executing the command
    cmd_status=$?

    if [ $cmd_status -eq 0 ]; then
        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" <<EOF
        INSERT INTO commute_history
            (account_id, fare_ammount, commute_system, fare_type, timestamp)
        VALUES
            ('$account_id', '$transaction_amount', '$commute_system_name', '$fare_type', '$next_timestamp');
        EOF
    fi
fi

# Fetch the employee IDs from the database using psql and environment variables
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" <<EOF
INSERT INTO transaction_history
    (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
VALUES
    ('$account_id', '$transaction_amount', '$transaction_tax_rate', '$transaction_title', '$transaction_description');
EOF

# Capture the exit status immediately after executing the command
cmd_status=$?

# Log if the first transaction was successful
if [ $cmd_status -eq 0 ]; then
    echo "Transaction successfully created for account_id $account_id"

    # Check if destination_account_id is provided as the sixth argument
    if [ $# -eq 7 ]; then
        destination_account_id=$7

        # Execute the second psql query for the destination_account_id
        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ('$destination_account_id', ABS('$transaction_amount'), '$transaction_title', '$transaction_description')" -t

        # Capture the exit status immediately after executing the command
        cmd_status=$?

        # Log if the second transaction was successful
        if [ $cmd_status -eq 0 ]; then
            echo "Transaction successfully created for destination_account_id $destination_account_id"
        else
            echo "Transaction creation failed for destination_account_id $destination_account_id"
        fi
    fi

    # Check if the unique_id is prefixed with "loan_"
    if echo "${unique_id}" | grep -q "^loan_"; then
        transaction_amount_abs=$((transaction_amount * -1))
        # Decrement the loan_amount in the loans table
        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount - '$transaction_amount_abs' WHERE loan_id = '$id'" -t

        # Capture the exit status immediately after executing the command
        cmd_status=$?

        # Log if the loan_amount was successfully decremented
        if [ $cmd_status -eq 0 ]; then
            echo "Loan amount successfully decremented for id $id"

            loanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT loan_amount FROM loans WHERE loan_id = '$id'" -t)

            # If loan_amount is less than transaction_amount, update loan_plan_amount to loan_amount
            if [ "$(echo "$loanAmount < $transaction_amount_abs" | bc -l)" -eq 1 ]; then
                PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_plan_amount = loan_amount WHERE loan_id = '$id' AND loan_amount < loan_plan_amount" -t

                # Capture the exit status immediately after executing the command
                cmd_status=$?

                # Update the crontab to reflect the new loan_plan_amount
                if [ $cmd_status -eq 0 ]; then
                    echo "Loan plan amount successfully updated for id $id"
                    (crontab -l | grep -v "/app/scripts/createTransaction.sh ${unique_id}" || true) | crontab -
                    (
                        crontab -l
                        echo "0 0 * * * /app/scripts/createTransaction.sh ${unique_id} ${account_id} ${id} ${loanAmount} \"${transaction_title}\" \"${transaction_description}\" > /app/cron.log 2>&1"
                    ) | crontab -
                else
                    echo "Loan plan amount update failed for id $id"
                fi
            fi

            getLoanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT loan_amount FROM loans WHERE loan_id = '$id'" -t)

            # Capture the exit status immediately after executing the command
            cmd_status=$?

            # Log if the loan_amount was successfully fetched
            if [ $cmd_status -eq 0 ]; then
                echo "Loan amount successfully fetched for id $id"

                # Check if the loan_amount is less than or equal to 0
                if [ "$(echo "$getLoanAmount <= 0" | bc -l)" -eq 1 ]; then
                    # If so, remove the existing cron job for this unique id and the loan from the database
                    getCronJob=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT cron_job_id FROM loans WHERE loan_id = '$id'" -t)

                    # Capture the exit status immediately after executing the command
                    cmd_status=$?

                    # Log if the cron job was successfully fetched
                    if [ $cmd_status -eq 0 ]; then
                        echo "Cron job successfully fetched for id $id"
                        echo "Cron Job ID: $getCronJob"

                        getInterestCronJobId=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT interest_cron_job_id FROM loans WHERE loan_id = '$id'" -t)
                        getInterestCronJobUniqueId=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT unique_id FROM cron_jobs WHERE cron_job_id = '$getInterestCronJobId'" -t)

                        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM loans WHERE loan_id = '$id'" -t
                        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getCronJob'" -t
                        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getInterestCronJobId'" -t

                        (crontab -l | grep -v "/app/scripts/createTransaction.sh ${unique_id}" || true) | crontab -
                        (crontab -l | grep -v "${getInterestCronJobUniqueId}" || true) | crontab -

                        # Capture the exit status immediately after executing the command
                        cmd_status=$?

                        # Log if the loan was successfully deleted
                        if [ $cmd_status -eq 0 ]; then
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

        # Capture the exit status immediately after executing the command
        cmd_status=$?

        # Log if the wishlist was successfully fetched
        if [ $cmd_status -eq 0 ]; then
            echo "Wishlist successfully fetched for id $id"
            echo "Cron Job ID: $getWishlists"

            PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM wishlist WHERE wishlist_id = '$id'" -t
            PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "DELETE FROM cron_jobs WHERE cron_job_id = '$getWishlists'" -t

            (crontab -l | grep -v "/app/scripts/createTransaction.sh ${unique_id}" || true) | crontab -

            # Capture the exit status immediately after executing the command
            cmd_status=$?

            # Log if the wishlist was successfully deleted
            if [ $cmd_status -eq 0 ]; then
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
