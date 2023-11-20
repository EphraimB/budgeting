WITH employee_list AS (SELECT employee_id FROM employee)
    SELECT process_payroll_for_employee(employee_id) FROM employee_list;

SELECT cron.schedule('monthly-payroll-job', '0 0 1 * *', $$
    WITH employee_list AS (SELECT employee_id FROM employee)
    SELECT process_payroll_for_employee(employee_id) FROM employee_list;
$$);
