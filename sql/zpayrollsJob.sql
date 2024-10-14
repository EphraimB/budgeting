WITH job_list AS (SELECT id FROM jobs)
    SELECT process_payroll_for_job(id) FROM job_list;

SELECT cron.schedule('monthly-payroll-job', '0 0 1 * *', $$
    WITH job_list AS (SELECT id FROM jobs)
    SELECT process_payroll_for_job(id) FROM job_list;
$$);
