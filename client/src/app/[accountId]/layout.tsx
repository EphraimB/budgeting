import React from "react";
import DataManagementWidgets from "../../../components/DataManagementWidgets";
import { notFound } from "next/navigation";

async function getAccount(accountId: number) {
  const res = await fetch(`http://server:5001/api/accounts/${accountId}`);

  if (!res.ok) {
    return notFound();
  }

  return res.json();
}

async function getExpenses(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}

async function getTaxes(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch taxes");
  }

  return res.json();
}

async function getLoans(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/loans?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch loans");
  }

  return res.json();
}

async function getWishlists(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/wishlists?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch wishlists");
  }

  return res.json();
}

async function getTransfers(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/transfers?accountId=${accountId}`
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
  params: { accountId: string };
}) {
  const accountId = parseInt(params.accountId);

  await getAccount(parseInt(params.accountId));

  const expenses = await getExpenses(accountId);
  const taxes = await getTaxes(accountId);
  const loans = await getLoans(accountId);
  const wishlists = await getWishlists(accountId);
  const transfers = await getTransfers(accountId);

  return (
    <>
      <DataManagementWidgets
        accountId={accountId}
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
