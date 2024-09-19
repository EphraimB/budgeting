import { Job, PayrollTax } from "@/app/types/types";
import PayrollTaxesCards from "../../../../../../components/payrollTaxes/PayrollTaxesCards";

async function getJob(job_id: number) {
  const res = await fetch(`http://server:5001/api/jobs?id=${job_id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function getPayrollTaxes(job_id: number) {
  const res = await fetch(
    `http://server:5001/api/jobs/payroll/taxes?job_id=${job_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payroll taxes");
  }

  return res.json();
}

async function JobPayrollTaxes({ params }: { params: { job_id: string } }) {
  const job_id = parseInt(params.job_id);

  const job: Job[] = await getJob(job_id);
  const payroll_taxes: PayrollTax[] = await getPayrollTaxes(job_id);

  return <PayrollTaxesCards job={job[0]} payroll_taxes={payroll_taxes} />;
}

export default JobPayrollTaxes;
