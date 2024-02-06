"use server";

import { revalidatePath } from "next/cache";

interface LoanRequest {
  account_id: number;
  recipient: string;
  amount: number;
  plan_amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number | null;
  frequency_day_of_week: number | null;
  frequency_week_of_month: number | null;
  frequency_month_of_year: number | null;
  subsidized: number;
  interest_rate: number;
  interest_frequency_type: number;
  begin_date: string;
}

export async function addLoan(loan: LoanRequest) {
  console.log("loan: ", loan);
  const response = await fetch("http://server:5001/api/loans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loan),
  });
  const result = await response.json();

  revalidatePath("/[account_id]", "page");
  return result;
}

export async function editLoan(loan: LoanRequest, id: number) {
  const response = await fetch(`http://server:5001/api/loans/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loan),
  });
  const result = await response.json();

  revalidatePath("/[account_id]", "page");
  return result;
}

export async function deleteLoan(id: number) {
  await fetch(`http://server:5001/api/loans/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]", "page");
}
