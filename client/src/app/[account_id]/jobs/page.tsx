import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Job } from "@/app/types/types";
import JobCards from "../../../../components/JobCards";

async function getJobs() {
  const res = await fetch("http://server:5001/api/jobs");

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

async function Jobs({
  params,
}: {
  params: { account_id: string; add: boolean };
}) {
  const jobs: Job[] = await getJobs();

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Jobs
      </Typography>
      <br />
      {jobs.length === 0 ? (
        <Typography variant="h6">You have no jobs</Typography>
      ) : (
        <>
          <Typography variant="h6">You have {jobs.length} jobs</Typography>

          <JobCards jobs={jobs} />
        </>
      )}
    </Stack>
  );
}

export default Jobs;
