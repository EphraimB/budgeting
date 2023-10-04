"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import dayjs, { Dayjs } from "dayjs";
import AccountList from "./AccountList";
import DateRange from "./DateRange";
import TransactionDisplay from "./TransactionDisplay";
import Actions from "./Actions";

export default function AccountDisplay({ accounts }: { accounts: object[] }) {
  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [isComponentVisible, setComponentVisible] = useState(false);

  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

  function onAccountClick(account: any) {
    if (selectedAccountId === account.account_id) {
      // If the same account is clicked again, toggle the component's visibility
      setComponentVisible(!isComponentVisible);
    } else {
      setSelectedAccountId(account.account_id);
      setComponentVisible(false);
    }
  }

  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <AccountList
        accounts={accounts}
        onAccountClick={onAccountClick}
        selectedAccountId={selectedAccountId}
      />
      {isComponentVisible && selectedAccountId && (
        <Actions accountId={selectedAccountId} />
      )}
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
    </Box>
  );
}
