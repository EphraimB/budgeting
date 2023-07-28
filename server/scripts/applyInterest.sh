#!/bin/sh

unique_id=$1
account_id=$2
id=$3
interest_rate=$4
transaction_title=$5
transaction_description=$6

# Update the loan_amount in the loans table
updateLoanAmount=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount + (loan_amount * $interest_rate) WHERE loan_id = $id" -t)

# If successful
if [ $? -eq 0 ]; then
    echo "Interest successfully applied for id $id"
fi