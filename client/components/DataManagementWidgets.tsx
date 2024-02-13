"use client";

import React from "react";
import Box from "@mui/material/Box";
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

  // Identify the selected widget
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
    // ...other widgets
  ];

  // Separate the selected widget from the others
  const selectedWidget = widgets.find((widget) => widget.selected);
  const otherWidgets = widgets.filter((widget) => !widget.selected);

  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", overflowY: "hidden" }}
    >
      {/* Selected Widget */}
      <Box sx={{ flexShrink: 0, width: 300, height: 200, marginRight: 1 }}>
        {selectedWidget && selectedWidget.content}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ bgColor: "black" }} />

      {/* Scrollable Widget Area */}
      <Box
        sx={{
          display: "flex",
          overflowY: "auto",
          marginLeft: 1,
          "&::-webkit-scrollbar": {
            display: "none", // Hides scrollbar for a cleaner look
          },
          // Hints at more content
          "& > :last-child": {
            marginRight: "50px", // Adjust this value to ensure the last widget is partially visible
          },
        }}
      >
        {otherWidgets.map((widget, index) => (
          <Box
            key={widget.id}
            sx={{ flex: "0 0 auto", width: 300, height: 200, marginRight: 2 }}
          >
            {widget.content}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default DataManagementWidgets;
