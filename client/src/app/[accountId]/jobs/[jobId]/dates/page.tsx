import { Job, PayrollDate } from "@/app/types/types";
import PayrollDates from "../../../../../../components/payrollDates/PayrollDates";

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

async function JobDates({ params }: { params: Promise<{ jobId: string }> }) {
  const jobId = parseInt((await params).jobId);

  const job: Job = await getJob(jobId);
  const payrollDates: PayrollDate[] = await getPayrollDates(jobId);

  return <PayrollDates job={job} payrollDates={payrollDates} />;
}

export default JobDates;
