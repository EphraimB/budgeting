"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { Expense, Tax } from "@/app/types/types";
import ExpensesView from "./ExpensesView";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import MoreVert from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";

function ExpensesCards({
  expenses,
  taxes,
}: {
  expenses: Expense[];
  taxes: Tax[];
}) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        {showExpenseForm && (
          <Card sx={{ maxWidth: "18rem" }}>Edit form under construction</Card>
        )}

        {expenses.map((expense: Expense) => (
          <Card
            key={expense.id}
            sx={{ maxWidth: "18rem", position: "relative" }}
          >
            <IconButton
              aria-label="more"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
              }}
              size="small"
              onClick={handleClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <MoreVert />
            </IconButton>
            <ExpensesView expense={expense} taxes={taxes} />
          </Card>
        ))}
      </Stack>
      <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowExpenseForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default ExpensesCards;
