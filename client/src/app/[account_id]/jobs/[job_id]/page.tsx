import { Job } from "@/app/types/types";
import JobDetailsView from "../../../../../components/JobDetailsView";

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

  return <JobDetailsView job={job[0]} />;
}

export default JobDetails;
