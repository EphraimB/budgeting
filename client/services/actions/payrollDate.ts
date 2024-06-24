"use server";

import { revalidatePath } from "next/cache";

interface PayrollDateRequest {
  job_id: number;
  payroll_day: number;
}

export async function togglePayrollDate(payroll_date: PayrollDateRequest) {
  const response = await fetch(
    "http://server:5001/api/jobs/payroll/dates/toggle",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payroll_date),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");

  return result;
}

export async function addPayrollDate(payroll_date: PayrollDateRequest) {
  const response = await fetch("http://server:5001/api/jobs/payroll/dates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payroll_date),
  });
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");

  return result;
}

export async function editPayrollDate(
  payroll_date: PayrollDateRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/jobs/payroll/dates/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payroll_date),
    }
  );
  const result = await response.json();

  console.log(result);

  revalidatePath("/[account_id]/jobs", "page");
  return result;
}

export async function deletePayrollDate(id: number) {
  await fetch(`http://server:5001/api/jobs/payroll/dates/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]/jobs", "page");
}
