"use server";

import { Frequency } from "@/app/types/types";
import { revalidatePath } from "next/cache";

interface IncomeRequest {
  accountId: number;
  title: string;
  description: string;
  amount: number;
  frequency: Frequency;
  beginDate: string;
  endDate: string | null;
}

export async function addIncome(income: IncomeRequest) {
  const response = await fetch("http://server:5001/api/income", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(income),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editIncome(income: IncomeRequest, id: number) {
  const response = await fetch(`http://server:5001/api/income/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(income),
  });
  const result = await response.json();

  console.log(result)

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteIncome(id: number) {
  await fetch(`http://server:5001/api/income/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
