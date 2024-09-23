"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Typography } from "@mui/material";
import { addTransactionHistory } from "../../services/actions/transactionHistory";
import InputAdornment from "@mui/material/InputAdornment";
import { Account } from "@/app/types/types";

function AccountWithdrawalForm({
  account,
  setAccountModes,
}: {
  account: Account;
  setAccountModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const [amount, setAmount] = useState("0");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [amountError, setAmountError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const data = {
    accountId: account.accountId,
    amount: -amount,
    tax: 0,
    title,
    description,
  };

  const validateAmount = () => {
    if (!amount) {
      setAmountError("Amount is required");
      return false;
    }

    setAmountError("");

    return true;
  };

  const validateTitle = () => {
    if (!title) {
      setTitleError("Title is required");
      return false;
    }

    setTitleError("");

    return true;
  };

  const validateDescription = () => {
    if (!description) {
      setDescriptionError("Description is required");
      return false;
    }

    setDescriptionError("");

    return true;
  };

  const handleSubmit = async () => {
    const isAmountValid = validateAmount();
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();

    if (isAmountValid && isTitleValid && isDescriptionValid) {
      // Submit data
      try {
        await addTransactionHistory(data);
      } catch (error) {
        console.log(error);
      }

      setAccountModes((prevModes: any) => ({
        ...prevModes,
        [account.accountId]: "view",
      }));
    }
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
            [account.accountId]: "view",
          }))
        }
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Typography variant="subtitle2">
        Withdraw from {account.name} account of ${account.balance}
      </Typography>
      <Stack direction="column" spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TextField
            id="amount"
            label="Amount"
            type="number"
            value={amount ? amount : "0"}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            error={!!amountError}
            helperText={amountError}
            variant="standard"
            fullWidth
          />
        </Box>
        <TextField
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!titleError}
          helperText={titleError}
          variant="standard"
        />
        <TextField
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!descriptionError}
          helperText={descriptionError}
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
