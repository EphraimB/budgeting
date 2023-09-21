"use client";

import AccountList from "./AccountList";

export default function AccountDisplay({ accounts }: { accounts: object[] }) {
  function onAccountClick(account: object[]) {
    console.log(account);
  }

  return (
    <main>
      <AccountList accounts={accounts} onAccountClick={onAccountClick} />
    </main>
  );
}
