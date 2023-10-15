"use client";

import React, { useState } from "react";
import DateRange from "../../../../components/DateRange";
import TransactionDisplay from "../../../../components/TransactionDisplay";
import dayjs, { Dayjs } from "dayjs";

function TransactionsPage({ params }: { params: { account_id: string } }) {
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

  const accountId = parseInt(params.account_id);

  return (
    <>
      <DateRange
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />
      {fromDate && toDate && (
        <TransactionDisplay
          accountId={accountId}
          fromDate={fromDate}
          toDate={toDate}
        />
      )}
    </>
  );
}

export default TransactionsPage;
