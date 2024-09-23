"use server";

import { revalidatePath } from "next/cache";

interface PayrollTaxRequest {
  jobId: number;
  name: string;
  rate: number;
}

export async function addPayrollTax(payroll_tax: PayrollTaxRequest) {
  const response = await fetch("http://server:5001/api/jobs/payroll/taxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payroll_tax),
  });
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");

  return result;
}

export async function editPayrollTax(
  payroll_tax: PayrollTaxRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/jobs/payroll/taxes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payroll_tax),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");
  return result;
}

export async function deletePayrollTax(id: number) {
  await fetch(`http://server:5001/api/jobs/payroll/taxes/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]/jobs", "page");
}
