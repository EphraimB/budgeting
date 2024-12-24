import React from "react";
import DataManagementWidgets from "../../../components/DataManagementWidgets";
import { notFound } from "next/navigation";

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    return notFound();
  }

  return res.json();
}

async function getIncome(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/income?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch income");
  }
}

async function getExpenses(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch expenses");
  }
}

async function getTaxes(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/taxes?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch taxes");
  }
}

async function getLoans(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/loans?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch loans");
  }
}

async function getWishlists(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/wishlists?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch wishlists");
  }
}

async function getTransfers(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/transfers?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch transfers");
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const accountId = parseInt((await params).accountId);

  const accounts = await getAccounts();
  const incomes = await getIncome(accountId);
  const expenses = await getExpenses(accountId);
  const taxes = await getTaxes(accountId);
  const loans = await getLoans(accountId);
  const wishlists = await getWishlists(accountId);
  const transfers = await getTransfers(accountId);

  return (
    <>
      <DataManagementWidgets
        accountId={accountId}
        accounts={accounts}
        incomes={incomes}
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
