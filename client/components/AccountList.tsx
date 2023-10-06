import { useState } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import NewAccountForm from "./NewAccountForm";
import AccountView from "./AccountView";
import AccountDelete from "./AccountDelete";

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
  const [accountMode, setAccountMode] = useState(0);

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
          elevation={account.account_id === selectedAccountId ? 1 : 4}
          sx={{
            position: "relative",
            p: 2,
          }}
        >
          {accountMode === 0 ? (
            <AccountView
              account={account}
              setAccountMode={setAccountMode}
              onAccountClick={onAccountClick}
            />
          ) : accountMode === 1 ? (
            <AccountView
              account={account}
              setAccountMode={setAccountMode}
              onAccountClick={onAccountClick}
            />
          ) : accountMode === 2 ? (
            <AccountDelete account={account} setAccountMode={setAccountMode} />
          ) : (
            <AccountView
              account={account}
              setAccountMode={setAccountMode}
              onAccountClick={onAccountClick}
            />
          )}
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
