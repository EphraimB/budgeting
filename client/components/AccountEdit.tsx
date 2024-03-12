"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { editAccount } from "../services/actions/account";
import { useAlert, useSnackbar } from "../context/FeedbackContext";

export default function AccountEdit({
  account,
  setAccountModes,
}: {
  account: any;
  setAccountModes: any;
}) {
  const [accountName, setAccountName] = useState(account.account_name);

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

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();

    if (isNameValid) {
      // Submit data
      try {
        await editAccount(data, account.account_id);

        // Show success message
        showSnackbar(`Account named "${accountName}" edited successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error editing account named "${accountName}"`, "error");
      }

      setAccountModes((prevModes: any) => ({
        ...prevModes,
        [account.account_id]: "view",
      }));
    }
  };

  return (
    <>
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
      <Stack direction="column" spacing={2}>
        <TextField
          id="account_name"
          label="Account name"
          variant="standard"
          value={accountName}
          onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAccountName(event.target.value);
          }}
          error={!!nameError}
          helperText={nameError}
        />

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Edit Account
        </Button>
      </Stack>
    </>
  );
}
