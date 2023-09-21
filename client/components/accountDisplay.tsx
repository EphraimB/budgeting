"use client";

import { useState } from "react";
import AccountList from "./AccountList";

export default function AccountDisplay({ accounts }: { accounts: object[] }) {
  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  function onAccountClick(account: any) {
    setSelectedAccountId(account.account_id);
  }

  return (
    <main>
      <AccountList
        accounts={accounts}
        onAccountClick={onAccountClick}
        selectedAccountId={selectedAccountId}
      />
    </main>
  );
}
