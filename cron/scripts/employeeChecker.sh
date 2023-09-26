#!/bin/sh

# Fetch the employee IDs from the database using psql and environment variables
employeeIds=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT employee_id FROM employee" -t)

# Loop through the employee IDs and call the script for each employee
for employeeId in $employeeIds; do
    # The name of the getPayrollsByEmployee.sh script
    scriptName="getPayrollsByEmployee.sh"

    # Check if the script exists at the given path
    if [ -f /app/scripts/"$scriptName" ]; then
        # If the script exists, execute it with the current employee ID as an argument
        cd /app/scripts || exit

        "$scriptName" "$employeeId"

        cd /app || exit

        # Print a message indicating that the script was executed
        echo "Executed script for employee $employeeId"
    else
        # If the script does not exist, print an error message
        echo "Error: The script $scriptName does not exist"
    fi
done
