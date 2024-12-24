import { useState } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountActionsMenu from "./AccountActionsMenu";
import Box from "@mui/material/Box";
import Link from "next/link";
import { Account } from "@/app/types/types";

function AccountView({
  account,
  setAccountModes,
}: {
  account: Account;
  setAccountModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleClick}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <AccountActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setAccountModes={setAccountModes}
        accountId={account.id}
      />
      <br />
      <Link
        href={`/${account.id}`}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <Typography variant="subtitle1" color="text.primary">
          {account.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ${(Math.round(account.balance * 100) / 100).toFixed(2)}
        </Typography>
      </Link>
    </Box>
  );
}

export default AccountView;
