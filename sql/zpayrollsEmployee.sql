DO $$
DECLARE
    employee_record RECORD;
    query text;
BEGIN
    -- Load the query from an external file
    query := plpython_function_to_read_file('../../zgetPayrollsByEmployee.txt');

    FOR employee_record IN SELECT employee_id FROM employee
    LOOP
        -- Replace placeholder with actual employee ID
        query := replace(query, '%s', employee_record.employee_id::text);

        -- Execute the query
        EXECUTE query;
    END LOOP;
END$$;
