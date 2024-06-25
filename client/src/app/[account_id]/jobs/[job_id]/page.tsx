import { Job, PayrollDate } from "@/app/types/types";
import JobDetailsView from "../../../../../components/JobDetailsView";

async function getJob(job_id: number) {
  const res = await fetch(`http://server:5001/api/jobs?id=${job_id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function getPayrollDates(job_id: number) {
  const res = await fetch(
    `http://server:5001/api/jobs/payroll/dates?job_id=${job_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payroll dates");
  }

  return res.json();
}

async function JobDetails({
  params,
}: {
  params: { account_id: string; job_id: string };
}) {
  const account_id = parseInt(params.account_id);
  const job_id = parseInt(params.job_id);

  const job: Job[] = await getJob(job_id);
  const payroll_dates: PayrollDate[] = await getPayrollDates(job_id);

  return (
    <JobDetailsView
      account_id={account_id}
      job={job[0]}
      payroll_dates={payroll_dates}
    />
  );
}

export default JobDetails;
