"use client";

import Image from "next/image";
import AccountList from "../../components/AccountList";

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    // This will activate the closest `errpor.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getTransactions({
  accountId,
  startDate,
  endDate,
}: {
  accountId: number;
  startDate: string;
  endDate: string;
}) {
  const res = await fetch(
    `http://server:5001/api/transactions?account_id=${accountId}&start_date=${startDate}&end_date=${endDate}}`
  );

  if (!res.ok) {
    // This will activate the closest `errpor.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const accounts = await getAccounts();

  function onAccountClick(account: any) {
    console.log(account);
  }

  return (
    <main>
      <AccountList
        accounts={accounts}
        onAccountClick={onAccountClick}
      />
    </main>
  );
}
