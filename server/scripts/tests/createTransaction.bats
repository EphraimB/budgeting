#!/usr/bin/env bats

setup() {
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/createTransaction:$PATH"

    touch "$BATS_TEST_DIRNAME/mocks/createTransaction/query_call_count.txt"
    touch "$BATS_TEST_DIRNAME/mocks/createTransaction/mocked_crontab_entries.txt"
    echo /app/dist/scripts/createTransaction.sh loan_91011_dqfwfw ${account_id} ${transaction_id} ${amount} ${transaction_name} ${transaction_description} ${destination_account_id} >>"$BATS_TEST_DIRNAME/mocks/createTransaction/mocked_crontab_entries.txt"
    chmod +w "$BATS_TEST_DIRNAME/mocks/createTransaction/mocked_crontab_entries.txt"
}

teardown() {
    PATH="$ORIGINAL_PATH"

    rm "$BATS_TEST_DIRNAME/mocks/createTransaction/query_call_count.txt"
    rm "$BATS_TEST_DIRNAME/mocks/createTransaction/mocked_crontab_entries.txt"

}

@test "Successful payroll transaction creation" {
    run ../createTransaction.sh payroll_1234 5678 91011 1000 "Payroll Transaction" "Transaction for August" null 0
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}

@test "Successful loan transaction creation and loan decrement and loan amount less than or equal to 0" {
    run ../createTransaction.sh loan_1234 5678 91011 -1000 "Loan Transaction" "Loan for August"
    [ "$status" -eq 0 ]
    echo "$output"
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
    [[ "$output" =~ "Loan amount successfully decremented for id 91011" ]]
    [[ "$output" =~ "Loan plan amount successfully updated for id 91011" ]]
    [[ "$output" =~ "Loan amount successfully fetched for id 91011" ]]
    [[ "$output" =~ "Cron job successfully fetched for id 91011" ]]
    [[ "$output" =~ "Cron Job ID: 1" ]]
    [[ "$output" =~ "Loan successfully deleted for id 91011" ]]
}

@test "Successful income transaction creation" {
    run ../createTransaction.sh income_1234 5678 91011 1000 "Income Transaction" "Income for August"
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}

@test "Successful expense transaction creation" {
    run ../createTransaction.sh expense_1234 5678 91011 -1000 "Expense Transaction" "Expense for August"
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}

@test "Successful transfer transaction creation" {
    run ../createTransaction.sh transfer_1234 5678 91011 -1000 "Transfer Transaction" "Transfer for August" 1235
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
    [[ "$output" =~ "Transaction successfully created for destination_account_id 1235" ]]
}
