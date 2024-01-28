"use server";

import { Expense } from "@/app/types/types";
import { revalidatePath } from "next/cache";

export async function addExpense(expense: Expense) {
  const response = await fetch("http://server:5001/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });
  const result = await response.json();

  revalidatePath("/expenses");
  return result;
}

export async function editExpense(expense: Expense, id: number) {
  const response = await fetch(`http://server:5001/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });
  const result = await response.json();

  revalidatePath("/expenses");
  return result;
}

export async function deleteExpense(id: number) {
  await fetch(`http://server:5001/api/expenses/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/expenses");
}
