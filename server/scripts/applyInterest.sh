#!/bin/sh

id=$3
interest_rate=$4

# Update the loan_amount in the loans table
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "UPDATE loans SET loan_amount = loan_amount + (loan_amount * $interest_rate) WHERE loan_id = $id" -t

# If successful
if mycmd; then
    echo "Interest successfully applied for id $id"
fi
