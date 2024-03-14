"use server";

import { revalidatePath } from "next/cache";

interface JobRequest {
  name: string;
  hourly_rate: number;
  regular_hours: number;
  vacation_days: number;
  sick_days: number;
  work_schedule: string;
}

export async function addJob(job: JobRequest) {
  const response = await fetch("http://server:5001/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  const result = await response.json();

  revalidatePath("/[account_id]/jobs", "page");

  return result;
}

export async function editJobs(job: JobRequest, id: number) {
  const response = await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  const result = await response.json();

  revalidatePath("/[account_id]/jobs", "page");
  return result;
}

export async function deleteJob(id: number) {
  await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]/jobs", "page");
}
