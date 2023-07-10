#!/bin/bash

# Fetch the employee IDs from the database using psql and environment variables
createTransaction=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ($2, $3, '$4', '$5')" -t)

# Log if the transaction was successful
if [ $? -eq 0 ]; then
    echo "Transaction successful created"
else
    echo "Transaction creation failed"
fi

# If 