"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import NewAccountForm from "./NewAccountForm";
import AccountView from "./AccountView";
import AccountDelete from "./AccountDelete";
import AccountEdit from "./AccountEdit";
import { Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountDepositForm from "./AccountDepositForm";
import AccountWithdrawalForm from "./AccountWithdrawalForm";
import { usePathname } from "next/navigation";
import { useAccounts } from "../context/FeedbackContext";

function AccountList() {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [accountModes, setAccountModes] = useState<Record<number, string>>({});

  const { accounts, loading } = useAccounts();

  const pathname = usePathname();

  const account_id = parseInt(pathname.split("/")[2]);

  return loading ? (
    <Stack direction="row" justifyContent="center" spacing={2}>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
    </Stack>
  ) : (
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
          elevation={account.account_id === account_id ? 1 : 4}
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
