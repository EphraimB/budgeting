"use client";

import { useState } from "react";
import AccountList from "./AccountList";
import TransactionDisplay from "./TransactionDisplay";

export default function AccountDisplay({ accounts }: { accounts: object[] }) {
  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  function onAccountClick(account: any) {
    setSelectedAccountId(account.account_id);
  }

  return (
    <>
      <AccountList
        accounts={accounts}
        onAccountClick={onAccountClick}
        selectedAccountId={selectedAccountId}
      />
      {selectedAccountId && (
        <TransactionDisplay accountId={selectedAccountId} />
      )}
    </>
  );
}
