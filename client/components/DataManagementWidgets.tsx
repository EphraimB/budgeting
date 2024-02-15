"use client";

import React from "react";
import Divider from "@mui/material/Divider";
import { Expense, Loan, Tax } from "@/app/types/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  calculateTotalWithTaxes,
  findLatestFullyPaidBackDate,
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const widgetWidth = "25vw"; // Adjust widget width here

  return (
    <Box sx={{ display: "flex", flexDirection: "row", p: 2 }}>
      {/* Selected Widget stays fixed */}
      <Box sx={{ mb: 2 }}>
        <Card raised sx={{ width: widgetWidth }}>
          <CardContent>
            <Typography gutterBottom variant="h5">
              {selectedWidget.title}
            </Typography>
            <Typography variant="body2">{selectedWidget.content}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Divider orientation="vertical" />

      {/* Scrollable Row for Other Widgets */}
      <Box sx={{ overflowX: "auto", p: 1, position: "relative" }}>
        <Box sx={{ display: "flex", flexDirection: "row", p: 1 }}>
          {otherWidgets.map((widget, index) => (
            <Box
              key={widget.id}
              sx={{
                width: widgetWidth,
                mr: -4, // Negative margin to create the overlap effect
                flexShrink: 0,
                ":last-child": {
                  mr: 0, // Remove negative margin for the last widget
                },
              }}
            >
              <Link
                href={widget.link}
                as={widget.link}
                style={{ color: "inherit", textDecoration: "inherit" }}
                passHref
              >
                <Card raised sx={{ width: "100%", cursor: "pointer" }}>
                  <CardContent>
                    <Typography gutterBottom variant="h6">
                      {widget.title}
                    </Typography>
                    <Typography variant="body2">{widget.content}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default DataManagementWidgets;
