"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { Expense, Tax } from "@/app/types/types";
import ExpensesView from "./ExpensesView";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import ExpenseDelete from "./ExpenseDelete";
import ExpenseEdit from "./ExpenseEdit";
import NewExpenseForm from "./NewExpenseForm";
import Grid from "@mui/material/Grid";

function ExpensesCards({
  accountId,
  expenses,
  taxes,
}: {
  accountId: number;
  expenses: Expense[];
  taxes: Tax[];
}) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseModes, setExpenseModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showExpenseForm && (
          <Grid key="new-expense" item>
            <NewExpenseForm
              accountId={accountId}
              setShowExpenseForm={setShowExpenseForm}
              taxes={taxes}
            />
          </Grid>
        )}

        {expenses.map((expense: Expense) => (
          <Grid key={expense.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {expenseModes[expense.id] === "delete" ? (
                <ExpenseDelete
                  expense={expense}
                  setExpenseModes={setExpenseModes}
                />
              ) : expenseModes[expense.id] === "edit" ? (
                <ExpenseEdit
                  accountId={accountId}
                  expense={expense}
                  setExpenseModes={setExpenseModes}
                  taxes={taxes}
                />
              ) : (
                <ExpensesView
                  expense={expense}
                  taxes={taxes}
                  setExpenseModes={setExpenseModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowExpenseForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default ExpensesCards;
