WITH job_list AS (SELECT job_id FROM jobs)
    SELECT process_payroll_for_job(job_id) FROM job_list;

SELECT cron.schedule('monthly-payroll-job', '0 0 1 * *', $$
    WITH employee_list AS (SELECT job_id FROM jobs)
    SELECT process_payroll_for_job(job_id) FROM job_list;
$$);
