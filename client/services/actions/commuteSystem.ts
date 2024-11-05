"use server";

import { revalidatePath } from "next/cache";

interface CommuteSystemRequest {
  name: string;
  fareCap: number | null;
  fareCapDuration: number | null;
}

export async function addCommuteSystem(commuteSystem: CommuteSystemRequest) {
  const response = await fetch(
    "http://server:5001/api/expenses/commute/systems",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commuteSystem),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editCommuteSystem(
  commuteSystem: CommuteSystemRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/expenses/commute/systems/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commuteSystem),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteCommuteSystem(id: number) {
  await fetch(`http://server:5001/api/expenses/commute/systems${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
