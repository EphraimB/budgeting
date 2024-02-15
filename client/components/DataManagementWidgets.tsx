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
import Typography from "@mui/material/Typography";
import {
  calculateTotalWithTaxes,
  findLatestFullyPaidBackDate,
  getTaxRate,
} from "../utils/helperFunctions";

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
      } with a total of $${calculateTotalWithTaxes(expenses, taxes).toFixed(
        2
      )} including taxes.`,
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
    <Grid container direction="row" spacing={2}>
      {/* Selected Widget */}
      <Grid key={selectedWidget.id} item xs={5} md={2}>
        <Link
          href={selectedWidget.link}
          as={selectedWidget.link}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{selectedWidget.title}</Typography>
            <Typography variant="body1">{selectedWidget.content}</Typography>
          </Paper>
        </Link>
      </Grid>

      <Grid item xs={2} md={1}>
        <Divider orientation="vertical" flexItem />
      </Grid>

      {/* Other Widgets */}
      {otherWidgets.map((widget) => (
        <Grid key={widget.id} item xs={5} md={2}>
          <Link
            href={widget.link}
            as={widget.link}
            style={{ color: "inherit", textDecoration: "inherit" }}
          >
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{widget.title}</Typography>
              <Typography variant="body1">{widget.content}</Typography>
            </Paper>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

export default DataManagementWidgets;
