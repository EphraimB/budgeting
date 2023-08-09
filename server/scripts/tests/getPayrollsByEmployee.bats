#!/usr/bin/env bats

setup() {
    # Back up the PATH and prepend the directory for our mock commands to it
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/getPayrollsByEmployee:$PATH"

    touch original_crontab_backup.txt
}

teardown() {
    # Restore the original PATH
    PATH="$ORIGINAL_PATH"
    # Restore the original crontab
    crontab original_crontab_backup.txt
    rm original_crontab_backup.txt
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
    echo "$output"

    # Now you check the contents of the real, updated crontab
    [[ $(cat updated_crontab.txt) == *"createTransaction.sh payroll_1_f47ac10b-58cc-4372-a567-0e02b2c3d479"* ]]
}
