"use server";

import { revalidatePath } from "next/cache";

interface TransferRequest {
  source_account_id: number;
  destination_account_id: number;
  amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_week: number | null;
  frequency_week_of_month: number | null;
  frequency_month_of_year: number | null;
  begin_date: string;
  end_date: string;
}

export async function addTransfer(transfer: TransferRequest) {
  const response = await fetch("http://server:5001/api/transfers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transfer),
  });
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]", "page");
  return result;
}

export async function editTransfer(transfer: TransferRequest, id: number) {
  const response = await fetch(`http://server:5001/api/transfers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transfer),
  });
  const result = await response.json();

  revalidatePath("/[account_id]", "page");
  return result;
}

export async function deleteTransfer(id: number) {
  await fetch(`http://server:5001/api/transfers/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]", "page");
}
