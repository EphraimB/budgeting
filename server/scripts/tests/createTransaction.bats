#!/usr/bin/env bats

setup() {
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/createTransaction:$PATH"
}

teardown() {
    PATH="$ORIGINAL_PATH"
}

@test "Successful payroll transaction creation" {
    run ../createTransaction.sh payroll_1234 5678 91011 1000 "Payroll Transaction" "Transaction for August" null 0
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}

@test "Successful loan transaction creation and loan decrement" {
    run ../createTransaction.sh loan_1234 5678 91011 1000 "Loan Transaction" "Loan for August"
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
    [[ "$output" =~ "Loan amount successfully decremented for id 91011" ]]
}

@test "Successful income transaction creation" {
    run ../createTransaction.sh income_1234 5678 91011 1000 "Income Transaction" "Income for August"
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}

@test "Successful expense transaction creation" {
    run ../createTransaction.sh expense_1234 5678 91011 1000 "Expense Transaction" "Expense for August"
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Transaction successfully created for account_id 5678" ]]
}
