"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

export default function NewAccountForm({
  setShowNewAccountForm,
}: {
  setShowNewAccountForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const [accountName, setAccountName] = useState("");

  const data = {
    name: accountName,
  };

  const onNewAccountSubmit = () => {
    const submitData = async () => {
      try {
        // Post request to create a new account
        await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        router.refresh();
      } catch (error) {
        console.error("There was an error creating the account!", error);
        // showAlert("There was an error creating the account!", "error");
      }
      setShowNewAccountForm(false);
      // showSnackbar("Account created!");
    };

    submitData();
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
        />

        <Button
          variant="contained"
          color="primary"
          onClick={onNewAccountSubmit}
        >
          Open Account
        </Button>
      </Stack>
    </Paper>
  );
}
