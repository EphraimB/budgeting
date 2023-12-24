"use server";

export async function addExpense(formData: FormData) {
  const expense_id = formData.get("expense_id");
  const expense = formData.get("expense");

  console.log("expense: ", expense);

  const response = await fetch(
    `http://server:5001/api/expenses/${expense_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense }),
    }
  );
  const result = await response.json();
  return result;
}
