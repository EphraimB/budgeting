"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { addAccount } from "../services/actions/account";

export default function NewAccountForm({
  setShowNewAccountForm,
}: {
  setShowNewAccountForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [accountName, setAccountName] = useState("");
  const [nameError, setNameError] = useState("");

  const data = {
    name: accountName,
  };

  const validateName = () => {
    if (!accountName) {
      setNameError("Name is required");
      return false;
    }

    setNameError("");

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();

    if (isNameValid) {
      // Submit data
      try {
        await addAccount(data);
      } catch (error) {
        console.log(error);
      }

      setShowNewAccountForm(false);
    }
  };

  return (
    <Paper
      elevation={1}
      component="form"
      sx={{
        position: "relative",
        p: 2,
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
        onClick={() => setShowNewAccountForm(false)}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Stack direction="column" spacing={2}>
        <TextField
          id="account_name"
          label="Account name"
          variant="standard"
          value={accountName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAccountName(event.target.value);
          }}
          error={!!nameError}
          helperText={nameError}
        />

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Open Account
        </Button>
      </Stack>
    </Paper>
  );
}
