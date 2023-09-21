import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

function AccountList({
  accounts,
  onAccountClick,
}: {
  accounts: object[];
  onAccountClick: any;
}) {
  return (
    <Stack direction="row" justifyContent="center" spacing={2}>
      {accounts.map((account: any) => (
        <Paper
          key={account.account_id}
          onClick={() => onAccountClick(account)}
          sx={{
            p: 2,
            cursor: "pointer",
            // elevation: account.account_id === selectedAccountId ? 0 : 4,
          }}
        >
          <Typography variant="subtitle1" color="text.primary">
            {account.account_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${account.account_balance}
          </Typography>
        </Paper>
      ))}
      <Button variant="contained" color="primary">
        Open New Account
      </Button>
    </Stack>
  );
}

export default AccountList;
