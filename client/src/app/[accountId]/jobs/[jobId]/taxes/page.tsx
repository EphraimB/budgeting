import { Job, PayrollTax } from "@/app/types/types";
import PayrollTaxesCards from "../../../../../../components/payrollTaxes/PayrollTaxesCards";

async function getJob(jobId: number) {
  const res = await fetch(`http://server:5001/api/jobs/${jobId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
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

async function JobPayrollTaxes({ params }: { params: { jobId: string } }) {
  const jobId = parseInt(params.jobId);

  const job: Job = await getJob(jobId);
  const payrollTaxes: PayrollTax[] = await getPayrollTaxes(jobId);

  return <PayrollTaxesCards job={job} payrollTaxes={payrollTaxes} />;
}

export default JobPayrollTaxes;
