"use client";

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
import { usePathname } from "next/navigation";
import { Account } from "@/app/types/types";

function AccountList({ accounts }: { accounts: Account[] }) {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [accountModes, setAccountModes] = useState<Record<number, string>>({});

  const pathname = usePathname();

  const accountId = parseInt(pathname.split("/")[1]);

  return (
    <Stack
      direction="row"
      justifyContent="center"
      spacing={2}
      sx={{
        mb: 5,
        width: "100%",
      }}
    >
      {accounts.map((account: Account) => (
        <Paper
          key={account.accountId}
          elevation={account.accountId === accountId ? 1 : 4}
          sx={{
            position: "relative",
            p: 2,
            width: 175,
          }}
        >
          {accountModes[account.accountId] === "delete" ? (
            <AccountDelete
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : accountModes[account.accountId] === "edit" ? (
            <AccountEdit account={account} setAccountModes={setAccountModes} />
          ) : accountModes[account.accountId] === "deposit" ? (
            <AccountDepositForm
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : accountModes[account.accountId] === "withdraw" ? (
            <AccountWithdrawalForm
              account={account}
              setAccountModes={setAccountModes}
            />
          ) : (
            <AccountView account={account} setAccountModes={setAccountModes} />
          )}
        </Paper>
      ))}

      {!showNewAccountForm && (
        <Tooltip title="Open new account">
          <Paper
            elevation={4}
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
