"use server";

import { revalidatePath } from "next/cache";

interface JobSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface JobRequest {
  accountId: number;
  name: string;
  hourlyRate: number;
  jobSchedule: JobSchedule[];
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

  revalidatePath("/[accountId]/jobs", "page");

  return result;
}

export async function editJob(job: JobRequest, id: number) {
  console.log(id);
  console.log(job);
  const response = await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  const result = await response.json();

  revalidatePath("/[accountId]/jobs", "page");
  return result;
}

export async function deleteJob(id: number) {
  await fetch(`http://server:5001/api/jobs/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]/jobs", "page");
}
