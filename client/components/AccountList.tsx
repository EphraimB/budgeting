"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";

function AccountList({ accounts }: /*onAccountClick*/ { accounts: any }) {
  return (
    <div>
      <List>
        {accounts.map((account: any) => (
          <ListItem
            key={account.account_id} /*onClick={() => onAccountClick(account)}*/
          >
            <ListItemText
              primary={account.account_name}
              secondary={`Balance: $${account.account_balance}`}
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
