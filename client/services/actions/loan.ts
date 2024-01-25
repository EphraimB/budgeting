"use server";

import { revalidatePath } from "next/cache";

export async function addLoan(loan: any) {
  const response = await fetch(`http://server:5001/api/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loan),
  });
  const result = await response.json();

  revalidatePath("/loans");
  return result;
}

export async function editLoan(loan: any, id: number) {
  const response = await fetch(`http://server:5001/api/loans/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loan),
  });
  const result = await response.json();

  revalidatePath("/loans");
  return result;
}

export async function deleteLoan(id: number) {
  await fetch(`http://server:5001/api/loans/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/loans");
}
