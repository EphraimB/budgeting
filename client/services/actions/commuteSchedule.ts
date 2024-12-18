"use server";

import { revalidatePath } from "next/cache";

interface CommuteScheduleRequest {
  fareDetailId: number;
  dayOfWeek: number;
  startTime: string;
}

export async function addCommuteSchedule(
  commuteSchedule: CommuteScheduleRequest
) {
  const response = await fetch(
    "http://server:5001/api/expenses/commute/schedule",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commuteSchedule),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[accountId]", "page");

  return result;
}
