import React, { useState } from "react";
import DateRange from "../../../components/DateRange";
import TransactionDisplay from "../../../components/TransactionDisplay";
import { useRouter } from "next/router";
import dayjs, { Dayjs } from "dayjs";

function transactionsPage() {
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

  const router = useRouter();
  const { account_id } = router.query as { account_id: string };

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
          accountId={parseInt(account_id)}
          fromDate={fromDate}
          toDate={toDate}
        />
      )}
    </>
  );
}

export default transactionsPage;
