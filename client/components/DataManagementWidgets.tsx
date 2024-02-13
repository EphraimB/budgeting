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

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ mb: 2, width: "100%", height: "20vh", alignItems: "flex-start" }}
    >
      {/* Selected Widget with fixed width */}
      <Box sx={{ width: "20%", height: "100%" }}>{selectedWidget.content}</Box>

      <Divider orientation="vertical" flexItem />

      {/* Scrollable Area for Other Widgets with fixed width */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Stack direction="row" spacing={2}>
          {otherWidgets.map((widget) => (
            <Box
              key={widget.id}
              sx={{
                width: "33%",
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
