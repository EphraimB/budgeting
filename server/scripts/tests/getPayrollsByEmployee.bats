#!/usr/bin/env bats

setup() {
    # Back up the PATH and prepend the directory for our mock commands to it
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/getPayrollsByEmployee:$PATH"
}

teardown() {
    # Restore the original PATH
    PATH="$ORIGINAL_PATH"
}

@test "Environment variables are set" {
    [ ! -z "${PGPASSWORD}" ]
    [ ! -z "${PGHOST}" ]
    [ ! -z "${PGPORT}" ]
    [ ! -z "${PGDB}" ]
    [ ! -z "${PGUSER}" ]
}

@test "Script creates new crontab entries for employee payroll" {
    run ../getPayrollsByEmployee.sh 1
    [ "$status" -eq 0 ]
    echo "Script Output: $output" 

    # Verify that crontab was updated correctly
    # This check assumes you've mocked uuidgen to return a specific UUID for testing
    cat "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/crontab"

    [[ $(cat "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/crontab") == *"createTransaction.sh payroll_1_f47ac10b-58cc-4372-a567-0e02b2c3d479"* ]]
}
