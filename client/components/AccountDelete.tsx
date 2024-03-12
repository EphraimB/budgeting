"use client";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { deleteAccount } from "../services/actions/account";
import { Account } from "@/app/types/types";
import { useRouter, usePathname } from "next/navigation";

function AccountDelete({
  account,
  setAccountModes,
}: {
  account: Account;
  setAccountModes: (prevModes: any) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const handleDelete = async () => {
    try {
      await deleteAccount(account.account_id);
    } catch (error) {
      console.log(error);
    }

    if (account.account_id === parseInt(pathname.split("/")[1])) {
      router.push("/");
    }

    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [account.account_id]: "view",
    }));
  };

  const handleCancel = () => {
    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [account.account_id]: "view",
    }));
  };

  return (
    <>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleCancel}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Box>
        <Typography variant="h6">Delete {account.account_name}?</Typography>
        <Typography variant="body1">
          Are you sure you want to delete this account? This action cannot be
          undone.
        </Typography>
        <br />
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="contained" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

export default AccountDelete;
