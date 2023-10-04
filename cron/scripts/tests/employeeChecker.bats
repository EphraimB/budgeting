#!/usr/bin/env bats

setup() {
    # Back up the PATH and prepend the directory for our mock commands to it
    ORIGINAL_PATH="$PATH"
    PATH="./mocks/employeeChecker:$PATH"
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

@test "getPayrollsByEmployee.sh script exists" {
    [ -f "../getPayrollsByEmployee.sh" ]
}

@test "getPayrollsByEmployee.sh script is executable" {
    [ -x "../getPayrollsByEmployee.sh" ]
}

@test "psql command returns employee IDs" {
    run psql  # this command should use the mock and output "1 2 3"
    [ "$status" -eq 0 ]
    [ "$output" = "1 2 3" ]
}
