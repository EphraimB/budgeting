import { useState } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function NewAccountForm({
  setShowNewAccountForm,
}: {
  setShowNewAccountForm: any;
}) {
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState("");

  const data = {
    name: accountName,
    type: 0,
    balance: accountBalance,
  };

  const onNewAccountSubmit = () => {
    const submitData = async () => {
      try {
        // Post request to create a new account
        await fetch("http://localhost:3000/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("There was an error creating the account!", error);
      }
      setShowNewAccountForm(false); // You might want to move this into the try block depending on desired behavior
    };

    submitData(); // Call the async function
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
        <TextField
          id="account_balance"
          label="Account balance"
          variant="standard"
          value={accountBalance}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAccountBalance(event.target.value);
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
