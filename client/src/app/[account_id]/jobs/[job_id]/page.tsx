import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

async function getJobs(job_id: number) {
  const res = await fetch(`http://server:5001/api/jobs?id=${job_id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function JobDetails({ params }: { params: { job_id: string } }) {
  const job_id = parseInt(params.job_id);

  const job: Job = await getJobs(job_id);

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Job Details for {job.name}
      </Typography>
    </Stack>
  );
}

export default JobDetails;
