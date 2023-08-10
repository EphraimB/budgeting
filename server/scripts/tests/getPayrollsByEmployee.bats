#!/usr/bin/env bats

setup() {
    # Back up the PATH and prepend the directory for our mock commands to it
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/getPayrollsByEmployee:$PATH"

    touch "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/mocked_crontab_entries.txt"
    chmod +w "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/mocked_crontab_entries.txt"
}

teardown() {
    # Restore the original PATH
    PATH="$ORIGINAL_PATH"

    rm "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/mocked_crontab_entries.txt"
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

    cat "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/mocked_crontab_entries.txt"

    # Check the contents of the mocked crontab entries to ensure the expected entry is present
    [[ $(cat "$BATS_TEST_DIRNAME/mocks/getPayrollsByEmployee/mocked_crontab_entries.txt") == *"createTransaction.sh payroll_1_f47ac10b-58cc-4372-a567-0e02b2c3d479"* ]]
}
