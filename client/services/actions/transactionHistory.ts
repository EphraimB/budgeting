"use server";

import { revalidatePath } from "next/cache";

export async function addTransactionHistory(expense: any) {
  const response = await fetch(
    "http://localhost:5001/api/transactions/history",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    }
  );
  const result = await response.json();

  revalidatePath("/");
  return result;
}
