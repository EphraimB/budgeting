import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import JobScheduleDayView from "../../../../../components/JobScheduleDayView";
import HourlyWage from "../../../../../components/HourlyWage";
import SickDays from "../../../../../components/SickDays";
import VacationDays from "../../../../../components/VacationDays";
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
    `http://server:5001/api/payroll_dates?job_id=${job_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payroll dates");
  }

  return res.json();
}

async function JobDetails({ params }: { params: { job_id: string } }) {
  const job_id = parseInt(params.job_id);

  const job: Job[] = await getJob(job_id);
  const payroll_dates = await getPayrollDates(job_id);

  return <JobDetailsView job={job[0]} />;
}

export default JobDetails;
