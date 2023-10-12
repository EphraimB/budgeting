import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useAlert } from "../context/FeedbackContext";
import { useSnackbar } from "../context/FeedbackContext";

function AccountSlip({ selectedAccountId }: { selectedAccountId: number }) {
  const [amount, setAmount] = useState(0.0);
  const [taxRate, setTaxRate] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [withdrawal, setWithdrawal] = useState(0);

  const { showAlert } = useAlert();
  const { showSnackbar } = useSnackbar();

  const data = {
    account_id: selectedAccountId,
    amount: withdrawal === 0 ? amount : -amount,
    tax: taxRate / 100,
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

    // Reset form
    setAmount(0);
    setTaxRate(0);
    setTitle("");
    setDescription("");
  };

  const handleNumericInput = (e: any) => {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\./g, "$1");
  };

  return (
    <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
      <CardHeader title="Account Slip" />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="column" spacing={2}>
          <FormControl>
            <InputLabel id="type">Type</InputLabel>
            <Select
              labelId="select-type"
              id="select-type"
              value={withdrawal}
              label="Deposit/Withdrawal"
              onChange={(e) => setWithdrawal(e.target.value as number)}
            >
              <MenuItem value={0}>Deposit</MenuItem>
              <MenuItem value={1}>Withdrawal</MenuItem>
            </Select>
          </FormControl>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextField
              fullWidth
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*[.]?[0-9]*",
              }}
              onInput={handleNumericInput}
              id="taxRate"
              label="Tax rate"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value as unknown as number)}
              variant="standard"
            />
            <InputLabel htmlFor="taxRate">%</InputLabel>
          </div>
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
          Submit slip
        </Button>
      </CardContent>
    </Card>
  );
}

export default AccountSlip;
