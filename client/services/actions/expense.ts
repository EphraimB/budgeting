"use server";

import { Frequency } from "@/app/types/types";
import { revalidatePath } from "next/cache";

interface ExpenseRequest {
  accountId: number;
  taxId: number | null;
  title: string;
  description: string;
  amount: number;
  subsidized: number;
  frequency: Frequency;
  beginDate: string;
  endDate: string | null;
}

export async function addExpense(expense: ExpenseRequest) {
  const response = await fetch("http://server:5001/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editExpense(expense: ExpenseRequest, id: number) {
  const response = await fetch(`http://server:5001/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteExpense(id: number) {
  await fetch(`http://server:5001/api/expenses/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
