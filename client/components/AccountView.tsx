import { useState } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountActionsMenu from "./AccountActionsMenu";
import Box from "@mui/material/Box";

function AccountView({
  account,
  setAccountModes,
  onAccountClick,
}: {
  account: any;
  setAccountModes: any;
  onAccountClick: any;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const accountViewClicked = () => {
    onAccountClick(account);
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
        accountId={account.account_id}
      />
      <br />
      <Box
        sx={{
          cursor: "pointer",
        }}
        onClick={accountViewClicked}
      >
        <Typography variant="subtitle1" color="text.primary">
          {account.account_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ${(Math.round(account.account_balance * 100) / 100).toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}

export default AccountView;
