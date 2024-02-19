"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { motion, useScroll, useTransform } from "framer-motion";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [centeredIndex, setCenteredIndex] = useState(0);

  const pathname = usePathname();

  const isSelected = (widgetId: string) => pathname.includes(widgetId);

  const latestFullyPaidBackDate = findLatestFullyPaidBackDate(loans);

  // const controls = useAnimation();
  // const refContainer = useRef<HTMLDivElement>(null);

  const widgets = [
    {
      id: "transactions",
      title: "Transactions",
      link: `/${account_id}/`,
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

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollCenter = container.scrollLeft + container.offsetWidth / 2;
      // Use the first child for width reference if it exists and is an HTMLElement
      const childWidth =
        container.firstChild instanceof HTMLElement
          ? container.firstChild.offsetWidth
          : 0;
      if (childWidth === 0) return;

      const newCenteredIndex = Math.round(scrollCenter / childWidth - 0.5);
      setCenteredIndex(newCenteredIndex);
    };

    containerRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      {/* Selected Widget stays fixed */}
      <Card raised sx={{ width: 300, height: 200 }}>
        <CardContent>
          <Typography gutterBottom variant="h5">
            {selectedWidget.title}
          </Typography>
          <Typography variant="body2">{selectedWidget.content}</Typography>
        </CardContent>
      </Card>
      <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1 }} />
      {/* Scrollable Row for Other Widgets */}
      <Box ref={containerRef} sx={{ overflowX: "scroll", display: "flex" }}>
        {otherWidgets.map((widget, index) => {
          const isCentered = index === centeredIndex;
          const scale = isCentered ? 1 : 0.8;

          return (
            <motion.div
              key={widget.id}
              style={{
                scale: isCentered ? 1 : 0.8,
                zIndex: isCentered ? 1 : 0,
                flexShrink: 0,
                left: -16,
                cursor: "pointer",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={widget.link}
                style={{ color: "inherit", textDecoration: "inherit" }}
                passHref
              >
                <Card sx={{ width: 300, height: 200, cursor: "pointer" }}>
                  {" "}
                  {/* Adjust size as needed */}
                  <CardContent>
                    <Typography variant="h5">{widget.title}</Typography>
                    <Typography variant="body2">{widget.content}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}

export default DataManagementWidgets;
