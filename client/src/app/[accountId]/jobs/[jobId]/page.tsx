import { Job, PayrollDate, PayrollTax } from "@/app/types/types";
import JobDetailsView from "../../../../../components/jobs/JobDetailsView";

async function getJob(jobId: number) {
  const res = await fetch(`http://server:5001/api/jobs/${jobId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function getPayrollDates(jobId: number) {
  const res = await fetch(
    `http://server:5001/api/jobs/payroll/dates?jobId=${jobId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payroll dates");
  }

  return res.json();
}

async function getPayrollTaxes(jobId: number) {
  const res = await fetch(
    `http://server:5001/api/jobs/payroll/taxes?jobId=${jobId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payroll taxes");
  }

  return res.json();
}

async function JobDetails({
  params,
}: {
  params: { accountId: string; jobId: string };
}) {
  const accountId = parseInt(params.accountId);
  const jobId = parseInt(params.jobId);

  const job: Job[] = await getJob(jobId);
  const payrollDates: PayrollDate[] = await getPayrollDates(jobId);
  const payrollTaxes: PayrollTax[] = await getPayrollTaxes(jobId);

  return (
    <JobDetailsView
      accountId={accountId}
      job={job[0]}
      payrollDates={payrollDates}
      payrollTaxes={payrollTaxes}
    />
  );
}

export default JobDetails;
