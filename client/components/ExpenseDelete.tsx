"use client";

import { Expense } from "@/app/types/types";
import Box from "@mui/material/Box";
import { deleteExpense } from "../services/actions/expense";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

function ExpenseDelete({
  expense,
  setExpenseModes,
}: {
  expense: Expense;
  setExpenseModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const handleDelete = async () => {
    try {
      await deleteExpense(expense.id);
    } catch (error) {
      console.log(error);
    }
    setExpenseModes((prev) => ({ ...prev, [expense.id]: "view" }));
  };

  const handleCancel = () => {
    setExpenseModes((prev) => ({ ...prev, [expense.id]: "view" }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleCancel}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <br />
      <Typography variant="subtitle1" component="h3">
        Delete "{expense.title}"?
      </Typography>
      <Button color="error" variant="contained" onClick={handleDelete}>
        Delete
      </Button>
      <Button color="primary" variant="contained" onClick={handleCancel}>
        Cancel
      </Button>
    </Box>
  );
}

export default ExpenseDelete;
