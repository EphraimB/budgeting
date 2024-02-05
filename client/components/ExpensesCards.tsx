"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
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
  account_id,
  expenses,
  taxes,
}: {
  account_id: number;
  expenses: Expense[];
  taxes: Tax[];
}) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseModes, setExpenseModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showExpenseForm && (
          <Grid item>
            <NewExpenseForm
              account_id={account_id}
              setShowExpenseForm={setShowExpenseForm}
              taxes={taxes}
            />
          </Grid>
        )}

        {expenses.map((expense: Expense) => (
          <Grid item>
            <Card
              key={expense.id}
              sx={{ maxWidth: "18rem", position: "relative" }}
            >
              {expenseModes[expense.id] === "delete" ? (
                <ExpenseDelete
                  expense={expense}
                  setExpenseModes={setExpenseModes}
                />
              ) : expenseModes[expense.id] === "edit" ? (
                <ExpenseEdit
                  expense={expense}
                  setExpenseModes={setExpenseModes}
                />
              ) : (
                <ExpensesView
                  expense={expense}
                  taxes={taxes}
                  expenseModes={expenseModes}
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
