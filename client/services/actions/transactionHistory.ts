"use server";

import { TransactionHistory } from "@/app/types/types";
import { revalidatePath } from "next/cache";

export async function addTransactionHistory(transaction: TransactionHistory) {
  const response = await fetch("http://server:5001/api/transactions/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });
  const result = await response.json();

  revalidatePath("/");
  return result;
}
