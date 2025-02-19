import { Job, PayrollDate, PayrollTax } from "@/app/types/types";
import JobDetailsView from "../../../../../components/jobs/JobDetailsView";

async function getJob(jobId: number) {
  try {
    const res = await fetch(`http://server:5001/api/jobs/${jobId}`);

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch jobs");
  }
}

async function getPayrollDates(jobId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/jobs/payroll/dates?jobId=${jobId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch payroll dates");
  }
}

async function getPayrollTaxes(jobId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/jobs/payroll/taxes?jobId=${jobId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch payroll taxes");
  }
}

async function JobDetails({
  params,
}: {
  params: Promise<{ accountId: string; jobId: string }>;
}) {
  const accountId = parseInt((await params).accountId);
  const jobId = parseInt((await params).jobId);

  const job: Job = await getJob(jobId);
  const payrollDates: PayrollDate[] = await getPayrollDates(jobId);
  const payrollTaxes: PayrollTax[] = await getPayrollTaxes(jobId);

  return (
    <JobDetailsView
      accountId={accountId}
      job={job}
      payrollDates={payrollDates}
      payrollTaxes={payrollTaxes}
    />
  );
}

export default JobDetails;
