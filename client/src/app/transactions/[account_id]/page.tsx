"use client";

import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import DateRange from "../../../../components/DateRange";
import TransactionDisplay from "../../../../components/TransactionDisplay";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DataManagementWidgets from "../../../../components/DataManagementWidgets";

function TransactionsPage({ params }: { params: { account_id: string } }) {
  const accountId = parseInt(params.account_id);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from_date, setFromDate] = useState<Dayjs>(
    searchParams.get("from_date")
      ? dayjs(searchParams.get("from_date"))
      : dayjs()
  );
  const [to_date, setToDate] = useState<Dayjs>(
    searchParams.get("to_date")
      ? dayjs(searchParams.get("to_date"))
      : dayjs().add(1, "month")
  );

  useEffect(() => {
    // Update the URL whenever from_date or to_date changes
    const updatedParams = new URLSearchParams();
    updatedParams.set("from_date", from_date.format().split("T")[0]);
    updatedParams.set("to_date", to_date.format().split("T")[0]);

    router.push(`${pathname}?${updatedParams.toString()}`);
  }, [from_date, to_date, pathname, router]);

  return (
    <>
      <DataManagementWidgets accountId={accountId} />
      <br />
      <DateRange
        from_date={from_date}
        to_date={to_date}
        handleFromDateChange={(e: Dayjs) => setFromDate(e)}
        handleToDateChange={(e: Dayjs) => setToDate(e)}
      />
      <TransactionDisplay
        accountId={accountId}
        from_date={from_date}
        to_date={to_date}
      />
    </>
  );
}

export default TransactionsPage;
