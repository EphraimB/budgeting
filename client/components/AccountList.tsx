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
  const [accountModes, setAccountModes] = useState<Record<number, string>>({});

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
          {accountModes[account.account_id] === "delete" ? (
            <AccountDelete account={account} setAccountMode={setAccountModes} />
          ) : accountModes[account.account_id] ===
            "edit" ? //     setAccountModes((prevModes) => ({ //   setAccountMode={() => //   account={account} // <AccountEdit
          //       ...prevModes,
          //       [account.account_id]: "view",
          //     }))
          //   } /*...other props...*/
          // />
          null : (
            <AccountView
              account={account}
              setAccountModes={setAccountModes}
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
