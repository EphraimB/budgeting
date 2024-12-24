import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Job } from "@/app/types/types";
import JobCards from "../../../../components/jobs/JobCards";

async function getJobs(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/jobs?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch jobs");
  }
}

async function Jobs({ params }: { params: Promise<{ accountId: string }> }) {
  const accountId = parseInt((await params).accountId);

  const jobs: Job[] = await getJobs(accountId);

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
          <Typography variant="h6">
            You have {jobs.length} job{jobs.length === 1 ? "" : "s"}
          </Typography>
        </>
      )}
      <JobCards jobs={jobs} accountId={accountId} />
    </Stack>
  );
}

export default Jobs;
