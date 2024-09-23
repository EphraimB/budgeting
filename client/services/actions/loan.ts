"use server";

import { Frequency } from "@/app/types/types";
import { revalidatePath } from "next/cache";

interface LoanRequest {
  accountId: number;
  recipient: string;
  amount: number;
  planAmount: number;
  title: string;
  description: string;
  frequency: Frequency;
  subsidized: number;
  interestRate: number;
  interestFrequencyType: number;
  beginDate: string;
}

export async function addLoan(loan: LoanRequest) {
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
