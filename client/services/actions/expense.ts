"use server";

import { revalidatePath } from "next/cache";

interface ExpenseRequest {
  account_id: number;
  tax_id: number | null;
  title: string;
  description: string;
  amount: number;
  subsidized: number;
  frequency_type: number;
  frequency_day_of_week: number;
  frequency_week_of_month: number;
  frequency_month_of_year: number;
  frequency_type_variable: number;
  begin_date: string;
  end_date: string | null;
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

  revalidatePath("/expenses");
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

  revalidatePath("/expenses");
  return result;
}

export async function deleteExpense(id: number) {
  await fetch(`http://server:5001/api/expenses/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/expenses");
}
