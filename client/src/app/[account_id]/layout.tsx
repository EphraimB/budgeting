import React from "react";
import DataManagementWidgets from "../../../components/DataManagementWidgets";
import { notFound } from "next/navigation";

async function getAccount(account_id: number) {
  const res = await fetch(`http://server:5001/api/accounts?id=${account_id}`);

  if (!res.ok) {
    return notFound();
  }

  return res.json();
}

async function getExpenses(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}

async function getTaxes(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch taxes");
  }

  return res.json();
}

async function getLoans(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/loans?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch loans");
  }

  return res.json();
}

async function getWishlists(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/wishlists?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch wishlists");
  }

  return res.json();
}

async function getTransfers(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/transfers?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transfers");
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

  await getAccount(parseInt(params.account_id));

  const expenses = await getExpenses(account_id);
  const taxes = await getTaxes(account_id);
  const loans = await getLoans(account_id);
  const wishlists = await getWishlists(account_id);
  const transfers = await getTransfers(account_id);

  return (
    <>
      <DataManagementWidgets
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
        loans={loans}
        wishlists={wishlists}
        transfers={transfers}
      />
      <br />
      {children}
    </>
  );
}
