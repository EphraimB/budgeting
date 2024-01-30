"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Tax } from "@/app/types/types";
import { CardContent, CardHeader, TextField } from "@mui/material";

function NewExpenseForm({
  setShowExpenseForm,
  taxes,
}: {
  setShowExpenseForm: Function;
  taxes: Tax[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
      <CardContent>
        <TextField
          label="Title"
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <br />
        <br />
        <TextField
          label="Description"
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />
      </CardContent>
    </Card>
  );
}

export default NewExpenseForm;
