"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { Expense, Loan, Tax } from "@/app/types/types";
import { usePathname } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "next/link";
import ArcText from "./ArcText";

function DataManagementWidgets({
  account_id,
  expenses,
  loans,
  taxes,
}: {
  account_id: number;
  expenses: Expense[];
  loans: Loan[];
  taxes: Tax[];
}) {
  const pathname = usePathname();

  const isSelected = (widgetId: string) => pathname.includes(widgetId);

  // Function to find tax rate by tax_id
  const getTaxRate = (tax_id: number | null) => {
    if (!tax_id) return 0;

    const tax = taxes.find((tax) => tax.id === tax_id);
    return tax ? tax.rate : 0;
  };

  // Calculate total expenses including taxes
  const totalWithTaxes = expenses.reduce((acc, expense) => {
    const taxRate = getTaxRate(expense.tax_id);
    const taxAmount = expense.amount * taxRate;
    return acc + expense.amount + taxAmount;
  }, 0);

  function findLatestFullyPaidBackDate(loans: Loan[]): Dayjs | string | null {
    if (loans.length === 0) return null; // Return null if no loans
    // Check if any loan has not been fully paid back
    if (loans.some((loan: Loan) => loan.fully_paid_back === null)) {
      return "not in the near future";
    }

    // Convert all fully_paid_back dates to Day.js objects and find the max
    let latest = dayjs(loans[0].fully_paid_back);
    loans.forEach((loan: Loan) => {
      const fullyPaidBackDate = dayjs(loan.fully_paid_back);
      if (fullyPaidBackDate.isAfter(latest)) {
        latest = fullyPaidBackDate;
      }
    });

    latest ? latest.format("dddd, MMMM D, YYYY h:mm A") : null;

    return latest;
  }

  const latestFullyPaidBackDate = findLatestFullyPaidBackDate(loans);

  const widgets = [
    {
      id: "transactions",
      title: "Transactions",
      link: `/${account_id}/transactions`,
      backgroundImage: "url('/img/back-to-transactions.png')",
      content: "Click here to view transactions",
      selected: isSelected("transactions"),
    },
    {
      id: "expenses",
      title: "Expenses",
      link: `/${account_id}/expenses`,
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/expenses.png')",
      content: `You have ${expenses.length} expense${
        expenses.length === 1 ? "" : "s"
      } with a total of $${totalWithTaxes.toFixed(2)} including taxes.`,
      selected: isSelected("expenses"),
    },
    {
      id: "loans",
      title: "Loans",
      link: `/${account_id}/loans`,
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/loans.png')",
      content: `You have ${loans.length} loan${
        loans.length === 1 ? "" : "s"
      } with a
      total of $${loans.reduce((acc, loan) => acc + loan.amount, 0).toFixed(2)}.
      ${
        loans.length === 0
          ? "You are debt free!"
          : latestFullyPaidBackDate
          ? `You will be debt free ${latestFullyPaidBackDate}.`
          : ""
      }`,
      selected: isSelected("loans"),
    },
  ];

  const selectedWidget =
    widgets.find((widget) => widget.selected) || widgets[0];
  const otherWidgets = widgets.filter((w) => w.id !== selectedWidget.id);

  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: "100%",
      }}
    >
      {/* Selected Widget */}
      <Link
        key={selectedWidget.id}
        href={selectedWidget.link}
        as={selectedWidget.link}
      >
        <Paper
          sx={{
            p: 2,
            width: "25%",
            height: "25%",
            borderRadius: "50%",
          }}
        >
          <ArcText text={selectedWidget.title} direction="downward" />
          <ArcText text={selectedWidget.content} direction="upward" />
        </Paper>
      </Link>

      <Divider orientation="vertical" flexItem />

      {/* Other Widgets */}
      {otherWidgets.map((widget) => (
        <Link key={widget.id} href={widget.link} as={widget.link}>
          <Paper
            sx={{
              p: 2,
              width: "25%",
              height: "25%",
              borderRadius: "50%",
            }}
          >
            <ArcText text={widget.title} direction="downward" />
            <ArcText text={widget.content} direction="upward" />
          </Paper>
        </Link>
      ))}
    </Grid>
  );
}

export default DataManagementWidgets;
