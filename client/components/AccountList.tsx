import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import NewAccountForm from "./NewAccountForm";
import AccountView from "./AccountView";
import AccountDelete from "./AccountDelete";
import AccountEdit from "./AccountEdit";
import { Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountDepositForm from "./AccountDepositForm";
import AccountWithdrawalForm from "./AccountWithdrawalForm";

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
            width: 175,
          }}
        >
          {accountModes[account.account_id] === "delete" ? (
            <AccountDelete
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : accountModes[account.account_id] === "edit" ? (
            <AccountEdit account={account} setAccountModes={setAccountModes} />
          ) : accountModes[account.account_id] === "deposit" ? (
            <AccountDepositForm
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : accountModes[account.account_id] === "withdraw" ? (
            <AccountWithdrawalForm
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : (
            <AccountView
              account={account}
              setAccountModes={setAccountModes}
              onAccountClick={onAccountClick}
            />
          )}
        </Paper>
      ))}

      {!showNewAccountForm && (
        <Tooltip title="Open new account">
          <Paper
            onClick={() => setShowNewAccountForm(true)}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 175,
              cursor: "pointer",
            }}
          >
            <IconButton>
              <AddIcon />
            </IconButton>
          </Paper>
        </Tooltip>
      )}

      {showNewAccountForm && (
        <NewAccountForm setShowNewAccountForm={setShowNewAccountForm} />
      )}
    </Stack>
  );
}

export default AccountList;
