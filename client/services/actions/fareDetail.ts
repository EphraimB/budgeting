"use server";

import { Timeslot } from "@/app/types/types";
import { revalidatePath } from "next/cache";

export interface FareDetailRequest {
  commuteSystemId: number;
  stationId: number;
  commuteSystemName: string;
  name: string;
  fare: number;
  timeslots: Timeslot[];
  alternateFareDetailId: number | null;
  dateCreated: string;
  dateModified: string;
}

export async function addFareDetail(fareDetail: FareDetailRequest) {
  const response = await fetch(
    "http://server:5001/api/expenses/commute/fares",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fareDetail),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editFareDetail(
  fareDetail: FareDetailRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/expenses/commute/fares/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fareDetail),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteFareDetail(id: number) {
  await fetch(`http://server:5001/api/expenses/commute/fares/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
