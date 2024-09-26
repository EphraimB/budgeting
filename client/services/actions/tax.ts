"use server";

import { revalidatePath } from "next/cache";

interface TaxRequest {
  rate: number;
  title: string;
  description: string;
  type: number;
}

export async function addTax(tax: TaxRequest) {
  const response = await fetch("http://server:5001/api/taxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tax),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");

  return result;
}

export async function editTax(tax: TaxRequest, id: number) {
  const response = await fetch(`http://server:5001/api/taxes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tax),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteTax(id: number) {
  await fetch(`http://server:5001/api/taxes/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
