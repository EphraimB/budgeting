import { Job, PayrollDate } from "@/app/types/types";
import PayrollDates from "../../../../../../components/PayrollDates";

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

async function JobDates({ params }: { params: { job_id: string } }) {
  const job_id = parseInt(params.job_id);

  const job: Job[] = await getJob(job_id);
  const payroll_dates: PayrollDate[] = await getPayrollDates(job_id);

  return <PayrollDates job={job[0]} payroll_dates={payroll_dates} />;
}

export default JobDates;
