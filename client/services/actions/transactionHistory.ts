"use server";

import { revalidatePath } from "next/cache";

interface TransactionHistoryRequest {
  account_id: number;
  amount: number;
  tax: number;
  title: string;
  description: string;
}

export async function addTransactionHistory(
  transaction: TransactionHistoryRequest
) {
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
