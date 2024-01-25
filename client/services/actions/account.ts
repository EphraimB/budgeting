"use server";

import { revalidatePath } from "next/cache";

export async function addAccount(account: any) {
  const response = await fetch(`http://server:5001/api/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(account),
  });
  const result = await response.json();

  revalidatePath("/");
  return result;
}

export async function editAccount(account: any, account_id: number) {
  const response = await fetch(
    `http://server:5001/api/accounts/${account_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    }
  );
  const result = await response.json();

  revalidatePath("/");
  return result;
}

export async function deleteAccount(account_id: number) {
  await fetch(`http://server:5001/api/accounts/${account_id}`, {
    method: "DELETE",
  });

  revalidatePath("/");
}
