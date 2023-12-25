"use server";

export async function addExpense(expense: any) {
  console.log("expense: ", expense);

  const response = await fetch(`http://server:5001/api/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });
  const result = await response.json();
  return result;
}
