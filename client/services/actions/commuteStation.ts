"use server";

import { revalidatePath } from "next/cache";

interface CommuteStationRequest {
  fromStation: string;
  toStation: string;
  tripDuration: number;
}

export async function addCommuteStation(commuteStation: CommuteStationRequest) {
  const response = await fetch(
    "http://server:5001/api/expenses/commute/stations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commuteStation),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editCommuteStation(
  commuteStation: CommuteStationRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/expenses/commute/stations/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commuteStation),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteCommuteStation(id: number) {
  await fetch(`http://server:5001/api/expenses/commute/stations/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
