#!/usr/bin/env bats

setup() {
    # Backup the original PATH
    ORIGINAL_PATH="$PATH"
    # Prepend our mock directory to the PATH
    PATH="./mocks/applyInterest:$PATH"
}

teardown() {
    # Restore the original PATH
    PATH="$ORIGINAL_PATH"
}

@test "Update loan interest successfully" {
    run ../applyInterest.sh 1234 5678 91011 0.05 "Transaction Title" "Transaction Description"
    [ "$status" -eq 0 ]
    [ "$output" = "Interest successfully applied for id 91011" ]
}

# You can add more tests as needed.
