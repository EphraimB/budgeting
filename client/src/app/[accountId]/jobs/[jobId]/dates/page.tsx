import { Job, PayrollDate } from "@/app/types/types";
import PayrollDates from "../../../../../../components/payrollDates/PayrollDates";

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

async function JobDates({ params }: { params: { jobId: string } }) {
  const jobId = parseInt(params.jobId);

  const job: Job[] = await getJob(jobId);
  const payrollDates: PayrollDate[] = await getPayrollDates(jobId);

  return <PayrollDates job={job[0]} payrollDates={payrollDates} />;
}

export default JobDates;
