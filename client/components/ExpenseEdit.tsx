"use client";

import { Expense } from "@/app/types/types";

function ExpenseEdit({
  expense,
  setExpenseModes,
}: {
  expense: Expense;
  setExpenseModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  return (
    <div>
      <h1>Edit form under construction</h1>
    </div>
  );
}

export default ExpenseEdit;
