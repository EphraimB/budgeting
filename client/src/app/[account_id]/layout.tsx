import React from "react";
import DataManagementWidgets from "../../../components/DataManagementWidgets";

async function getExpenses(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getTaxes(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getLoans(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/loans?account_id=${accountId}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { account_id: string };
}) {
  const account_id = parseInt(params.account_id);

  const expenses = await getExpenses(account_id);
  const taxes = await getTaxes(account_id);
  const loans = await getLoans(account_id);

  return (
    <>
      <DataManagementWidgets
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
        loans={loans}
      />
      <br />
      {children}
    </>
  );
}
