#!/bin/sh

unique_id=$1
account_id=$2
transaction_amount=$3
transaction_title=$4
transaction_description=$5

# Fetch the employee IDs from the database using psql and environment variables
createTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ('$account_id', '$transaction_amount', '$transaction_title', '$transaction_description')" -t)

# Log if the first transaction was successful
if [ $? -eq 0 ]; then
    echo "Transaction successfully created for account_id $account_id"
else
    echo "Transaction creation failed for account_id $account_id"
fi

# Check if destination_account_id is provided as the sixth argument
if [ $# -eq 6 ]; then
    destination_account_id=$6

    # Execute the second psql query for the destination_account_id
    createDestinationTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ('$destination_account_id', ABS('$transaction_amount'), '$transaction_title', '$transaction_description')" -t)

    # Log if the second transaction was successful
    if [ $? -eq 0 ]; then
        echo "Transaction successfully created for destination_account_id $destination_account_id"
    else
        echo "Transaction creation failed for destination_account_id $destination_account_id"
    fi
fi

# Check if the unique_id is prefixed with "wishlist_"
if echo "${unique_id}" | grep -q "^wishlist_"; then
    # If so, remove the existing cron job for this unique id
    (crontab -l | grep -v "/app/dist/scripts/createTransaction.sh ${unique_id}" || true) | crontab -
fi
