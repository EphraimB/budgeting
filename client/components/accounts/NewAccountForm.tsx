"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { addAccount } from "../../services/actions/account";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

export default function NewAccountForm({
  setShowNewAccountForm,
}: {
  setShowNewAccountForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [accountName, setAccountName] = useState("");
  const [nameError, setNameError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

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

        // Show success message
        showSnackbar(`Account named "${accountName}" added successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error adding account named "${accountName}"`, "error");
      }

      setShowNewAccountForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this account",
        "error"
      );
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
