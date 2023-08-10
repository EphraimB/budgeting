#!/bin/sh

id=$3
interest_rate=$4

# Update the loan_amount in the loans table and capture its output
output=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount + (loan_amount * $interest_rate) WHERE loan_id = $id" -t)

# Capture the exit status immediately after executing the command
cmd_status=$?

# If successful
if [ $cmd_status -eq 0 ]; then
    echo "Interest successfully applied for id $id"
else
    echo "Error: $output"
fi
