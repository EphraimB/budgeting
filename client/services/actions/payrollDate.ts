"use server";

import { revalidatePath } from "next/cache";

interface PayrollDateRequest {
  jobId: number;
  payrollDay: number;
}

export async function togglePayrollDate(payrollDate: PayrollDateRequest) {
  const response = await fetch(
    "http://server:5001/api/jobs/payroll/dates/toggle",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payrollDate),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]/jobs", "page");

  return result;
}

export async function addPayrollDate(payrollDate: PayrollDateRequest) {
  const response = await fetch("http://server:5001/api/jobs/payroll/dates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payrollDate),
  });
  const result = await response.json();

  revalidatePath("/[accountId]/jobs", "page");

  return result;
}

export async function editPayrollDate(
  payrollDate: PayrollDateRequest,
  id: number
) {
  const response = await fetch(
    `http://server:5001/api/jobs/payroll/dates/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payrollDate),
    }
  );
  const result = await response.json();

  revalidatePath("/[accountId]/jobs", "page");
  return result;
}

export async function deletePayrollDate(id: number) {
  await fetch(`http://server:5001/api/jobs/payroll/dates/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]/jobs", "page");
}
