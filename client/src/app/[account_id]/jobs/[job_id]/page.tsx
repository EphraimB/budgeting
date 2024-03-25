import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import JobScheduleDayView from "../../../../../components/JobScheduleDayView";
import HourlyWage from "../../../../../components/HourlyWage";
import SickDays from "../../../../../components/SickDays";
import VacationDays from "../../../../../components/VacationDays";

async function getJob(job_id: number) {
  const res = await fetch(`http://server:5001/api/jobs?id=${job_id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function JobDetails({ params }: { params: { job_id: string } }) {
  const job_id = parseInt(params.job_id);

  const job: Job[] = await getJob(job_id);

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Job Details for {job[0].name}
      </Typography>
      <br />
      <Stack direction="row" spacing={2} justifyContent="center">
        <HourlyWage hourly_wage={job[0].hourly_rate} />
        <SickDays sick_days={job[0].sick_days} />
        <VacationDays vacation_days={job[0].vacation_days} />
      </Stack>
      <br />
      <JobScheduleDayView job_schedule={job[0].job_schedule} />
    </Stack>
  );
}

export default JobDetails;
