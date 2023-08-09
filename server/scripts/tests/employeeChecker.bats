#!/usr/bin/env bats

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
    # Mock the psql command to return some dummy employee IDs for testing purposes.
    run mock_psql
    [ "$status" -eq 0 ]
    [ "$output" = "1 2 3" ]  # Example output for mocked psql command.
}

@test "Script is executed for each employee ID" {
    # Mock the psql command to return some dummy employee IDs.
    mock_psql

    # Run your script.
    run ../employeeChecker.sh
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Executed script for employee 1" ]]
    [[ "$output" =~ "Executed script for employee 2" ]]
    [[ "$output" =~ "Executed script for employee 3" ]]
}

# Mock function for psql to simulate fetching employee IDs.
mock_psql() {
    echo "1 2 3"
}
