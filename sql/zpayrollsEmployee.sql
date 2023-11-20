SELECT cron.schedule('monthly-payroll-job', '0 0 1 * *', $$
DO $$
DECLARE
    employee_record RECORD;
BEGIN
    FOR employee_record IN SELECT employee_id FROM employee
    LOOP
        PERFORM process_payroll_for_employee(employee_record.employee_id);
    END LOOP;
END$$;
$$);
