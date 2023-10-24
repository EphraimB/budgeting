"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

export default function AccountEdit({
  account,
  setAccountModes,
}: {
  account: any;
  setAccountModes: any;
}) {
  const router = useRouter();

  const [accountName, setAccountName] = useState(account.account_name);
  const data = {
    name: accountName,
  };

  const onEditAccountSubmit = () => {
    const submitData = async () => {
      try {
        // Post request to create a new account
        await fetch(`/api/accounts?account_id=${account.account_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        router.refresh();
      } catch (error) {
        console.error("There was an error editing the account!", error);
        // showAlert("There was an error editing the account!", "error");
      }
      setAccountModes((prevModes: any) => ({
        ...prevModes,
        [account.account_id]: "view",
      }));
      // showSnackbar("Account edited!");
    };

    submitData();
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
        />

        <Button
          variant="contained"
          color="primary"
          onClick={onEditAccountSubmit}
        >
          Edit Account
        </Button>
      </Stack>
    </>
  );
}
