"use server";

import { revalidatePath } from "next/cache";

interface AccountRequest {
  name: string;
}

export async function addAccount(account: AccountRequest) {
  const response = await fetch("http://server:5001/api/accounts", {
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

export async function editAccount(account: AccountRequest, accountId: number) {
  const response = await fetch(`http://server:5001/api/accounts/${accountId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(account),
  });
  const result = await response.json();

  revalidatePath("/");
  return result;
}

export async function deleteAccount(accountId: number) {
  await fetch(`http://server:5001/api/accounts/${accountId}`, {
    method: "DELETE",
  });

  revalidatePath("/");
}
