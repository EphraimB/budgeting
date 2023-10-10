import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useAlert } from "../context/FeedbackContext";
import { useSnackbar } from "../context/FeedbackContext";

function AccountSlip({ selectedAccountId }: { selectedAccountId: number }) {
  const [amount, setAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { showAlert } = useAlert();
  const { showSnackbar } = useSnackbar();

  const data = {
    account_id: selectedAccountId,
    amount,
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

  return (
    <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
      <CardHeader title="Account Slip" />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box>
          <TextField
            id="amount"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            variant="standard"
          />
          <TextField
            id="taxRate"
            label="Tax rate"
            value={taxRate + "%"}
            onChange={(e) => setTaxRate(parseInt(e.target.value))}
            variant="standard"
          />
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
        </Box>
        <br />
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Submit slip
        </Button>
      </CardContent>
    </Card>
  );
}

export default AccountSlip;
