"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { Expense, Tax } from "@/app/types/types";
import ExpensesView from "./ExpensesView";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";

function ExpensesCards({
  expenses,
  taxes,
}: {
  expenses: Expense[];
  taxes: Tax[];
}) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <>
      <Stack direction="row" spacing={2}>
        {showExpenseForm && (
          <Card sx={{ maxWidth: "18rem" }}>Edit form under construction</Card>
        )}

        {expenses.map((expense: Expense) => (
          <Card key={expense.id} sx={{ maxWidth: "18rem" }}>
            <ExpensesView expense={expense} taxes={taxes} />
          </Card>
        ))}
      </Stack>
      <br />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Fab color="primary" onClick={() => setShowExpenseForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default ExpensesCards;
