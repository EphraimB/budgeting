"use client";

import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Tax } from "@/app/types/types";

function NewExpenseForm({
  setShowExpenseForm,
  taxes,
}: {
  setShowExpenseForm: Function;
  taxes: Tax[];
}) {
  return (
    <Card
      component="form"
      sx={{
        position: "relative",
        maxWidth: "18rem",
      }}
    >
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={() => setShowExpenseForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <Typography variant="h6" component="h3">
        New Expense
      </Typography>
    </Card>
  );
}

export default NewExpenseForm;
