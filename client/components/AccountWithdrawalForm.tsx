import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert } from "../context/FeedbackContext";
import { useSnackbar } from "../context/FeedbackContext";
import { Typography } from "@mui/material";

function AccountWithdrawalForm({
  account,
  setAccountModes,
}: {
  account: any;
  setAccountModes: any;
}) {
  const [amount, setAmount] = useState(0.0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { showAlert } = useAlert();
  const { showSnackbar } = useSnackbar();

  const data = {
    account_id: account.account_id,
    amount: -amount,
    tax: 0,
    title,
    description,
  };

  const handleSubmit = () => {
    const submitForm = async () => {
      try {
        await fetch("http://localhost:3000/transactions/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error(error);
        showAlert("Failed to create transaction", "error");
      }
      showSnackbar("Transaction created!");
    };

    submitForm();

    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [account.account_id]: "view",
    }));
  };

  const handleNumericInput = (e: any) => {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\./g, "$1");
  };

  return (
    <Box>
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={() =>
          setAccountModes((prevModes: any) => ({
            ...prevModes,
            [account.account_id]: "view",
          }))
        }
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Typography variant="subtitle2">
        Withdraw from {account.account_name} account of $
        {account.account_balance}
      </Typography>
      <Stack direction="column" spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <InputLabel htmlFor="amount">$</InputLabel>
          <TextField
            fullWidth
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*[.]?[0-9]*",
            }}
            onInput={handleNumericInput}
            id="amount"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value as unknown as number)}
            variant="standard"
          />
        </Box>
        <TextField
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="standard"
        />
        <TextField
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="standard"
        />
      </Stack>
      <br />
      <Button variant="contained" color="secondary" onClick={handleSubmit}>
        Withdraw
      </Button>
    </Box>
  );
}

export default AccountWithdrawalForm;
