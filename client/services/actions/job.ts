"use server";

import { revalidatePath } from "next/cache";

interface JobSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface JobRequest {
  account_id: number;
  name: string;
  hourly_rate: number;
  vacation_days: number;
  sick_days: number;
  job_schedule: JobSchedule[];
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

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");

  return result;
}

export async function editJob(job: JobRequest, id: number) {
  const response = await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");
  return result;
}

export async function deleteJob(id: number) {
  await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]/jobs", "page");
}
