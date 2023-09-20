import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";

function AccountList({
  accounts,
  onAccountClick,
}: {
  accounts: any;
  onAccountClick: any;
}) {
  return (
    <div>
      <List>
        {accounts.map((account: any) => (
          <ListItem key={account.id} onClick={() => onAccountClick(account)}>
            <ListItemText
              primary={account.name}
              secondary={`Balance: $${account.balance}`}
            />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="primary">
        Open New Account
      </Button>
    </div>
  );
}

export default AccountList;
