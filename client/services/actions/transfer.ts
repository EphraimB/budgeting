"use server";

import { Frequency } from "@/app/types/types";
import { revalidatePath } from "next/cache";

interface TransferRequest {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  title: string;
  description: string;
  frequency: Frequency;
  beginDate: string;
  endDate: string | null;
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

  revalidatePath("/[accountId]", "page");
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

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteTransfer(id: number) {
  await fetch(`http://server:5001/api/transfers/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
