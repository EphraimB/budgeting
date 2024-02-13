"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import TransactionsWidget from "./TransactionsWidget";
import ExpensesWidget from "./ExpensesWidget";
import LoansWidget from "./LoansWidget";
import { Expense, Loan, Tax } from "@/app/types/types";
import { usePathname } from "next/navigation";

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

  const widgets = [
    {
      id: "transactions",
      content: <TransactionsWidget account_id={account_id} />,
      selected: isSelected("transactions"),
    },
    {
      id: "expenses",
      content: (
        <ExpensesWidget
          account_id={account_id}
          expenses={expenses}
          taxes={taxes}
        />
      ),
      selected: isSelected("expenses"),
    },
    {
      id: "loans",
      content: <LoansWidget account_id={account_id} loans={loans} />,
      selected: isSelected("loans"),
    },
    // Add more widgets as needed
  ];

  const selectedWidget =
    widgets.find((widget) => widget.selected) || widgets[0];
  const otherWidgets = widgets.filter((w) => w.id !== selectedWidget.id);

  // Calculate the minWidth for widgets in the scrollable area
  const widgetMinWidth = `calc(100% / ${Math.min(3, otherWidgets.length)})`;

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      {/* Selected Widget */}
      <Box>{selectedWidget.content}</Box>

      <Divider orientation="vertical" flexItem />

      {/* Scrollable Area for Other Widgets */}
      <Box
        sx={{
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Stack direction="row" spacing={2} sx={{ height: "100%" }}>
          {otherWidgets.map((widget, index) => (
            <Box
              key={widget.id}
              sx={{
                minWidth: widgetMinWidth,
              }}
            >
              {widget.content}
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export default DataManagementWidgets;
