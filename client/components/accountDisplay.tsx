"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import AccountList from "./AccountList";
import DateRange from "./DateRange";
import TransactionDisplay from "./TransactionDisplay";

export default function AccountDisplay({ accounts }: { accounts: object[] }) {
  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

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
        <>
          <DateRange
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
          {fromDate && toDate && (
            <TransactionDisplay
              accountId={selectedAccountId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </>
      )}
    </>
  );
}
