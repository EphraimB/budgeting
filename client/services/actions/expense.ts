"use server";

import { revalidatePath } from "next/cache";

export async function addExpense(expense: any) {
  const response = await fetch(`http://server:5001/api/expenses`, {
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

export async function editExpense(expense: any, id: number) {
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
