import { useState } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import NewAccountForm from "./NewAccountForm";

function AccountList({
  accounts,
  onAccountClick,
  selectedAccountId,
}: {
  accounts: object[];
  onAccountClick: any;
  selectedAccountId: number | null;
}) {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  return (
    <Stack
      direction="row"
      justifyContent="center"
      spacing={2}
      sx={{
        mb: 5,
      }}
    >
      {accounts.map((account: any) => (
        <Paper
          key={account.account_id}
          onClick={() => onAccountClick(account)}
          elevation={account.account_id === selectedAccountId ? 1 : 4}
          sx={{
            p: 2,
            cursor: "pointer",
          }}
        >
          <Typography variant="subtitle1" color="text.primary">
            {account.account_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${(Math.round(account.account_balance * 100) / 100).toFixed(2)}
          </Typography>
        </Paper>
      ))}

      {!showNewAccountForm && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowNewAccountForm(true)}
        >
          Open New Account
        </Button>
      )}

      {showNewAccountForm && (
        <NewAccountForm setShowNewAccountForm={setShowNewAccountForm} />
      )}
    </Stack>
  );
}

export default AccountList;
