"use client";

import React, { useState, useEffect, useRef } from "react";
import { Expense, Loan, Tax, Transfer, Wishlist } from "@/app/types/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  calculateTotalWithSubsidies,
  findLatestFullyPaidBackDate,
} from "../utils/helperFunctions";

function DataManagementWidgets({
  accountId,
  expenses,
  loans,
  wishlists,
  transfers,
  taxes,
}: {
  accountId: number;
  expenses: Expense[];
  loans: Loan[];
  wishlists: Wishlist[];
  transfers: Transfer[];
  taxes: Tax[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centeredIndex, setCenteredIndex] = useState(0);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const pathname = usePathname();

  const isSelected = (widgetId: string) => pathname.includes(widgetId);

  const latestFullyPaidBackDate = findLatestFullyPaidBackDate(loans);

  const widgets = [
    {
      id: "transactions",
      title: "Transactions",
      link: `/${accountId}/`,
      content: "Click here to view transactions",
      selected: isSelected("transactions"),
    },
    {
      id: "jobs",
      title: "Jobs",
      link: `/${accountId}/jobs`,
      content: "Click here to view your job info",
      selected: isSelected("jobs"),
    },
    {
      id: "taxes",
      title: "Taxes",
      link: `/${accountId}/taxes`,
      content: `You have ${taxes.length} tax${taxes.length === 1 ? "" : "es"}`,
      selected: isSelected("taxes"),
    },
    {
      id: "expenses",
      title: "Expenses",
      link: `/${accountId}/expenses`,
      content: `You have ${expenses.length} expense${
        expenses.length === 1 ? "" : "s"
      } with a total of $${calculateTotalWithSubsidies(expenses, taxes).toFixed(
        2
      )} including taxes and subsidies.`,
      selected: isSelected("expenses"),
    },
    {
      id: "loans",
      title: "Loans",
      link: `/${accountId}/loans`,
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
    {
      id: "wishlists",
      title: "Wishlists",
      link: `/${accountId}/wishlists`,
      content: `${
        wishlists.length === 0
          ? "You have nothing on your wishlist"
          : `You have ${wishlists.length} items on your wishlist.`
      }`,
      selected: isSelected("wishlists"),
    },
    {
      id: "transfers",
      title: "Transfers",
      link: `/${accountId}/transfers`,
      content: `${
        transfers.length === 0
          ? "You have no transfers"
          : `You have ${transfers.length} transfers.`
      }`,
      selected: isSelected("transfers"),
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
    <Stack direction="row" spacing={isSmallScreen ? 1 : 2}>
      {/* Selected Widget stays fixed */}
      <Card elevation={1} sx={{ width: 175, overflow: "visible" }}>
        <CardContent>
          <Typography gutterBottom variant="h5">
            {selectedWidget.title}
          </Typography>
          <Typography variant="body2">{selectedWidget.content}</Typography>
        </CardContent>
      </Card>

      {/* Scrollable Row for Other Widgets */}
      <Stack
        ref={containerRef}
        direction="row"
        spacing={isSmallScreen ? 1 : 2}
        sx={{
          overflowX: "scroll",
          width: "75%",
          "&::-webkit-scrollbar": { display: "none" },
          "&::MsOverflowStyle": "none",
          scrollbarWidth: "none",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {otherWidgets.map((widget, index) => {
          const isCentered = index === centeredIndex;
          const scale = isSmallScreen ? (isCentered ? 1 : 0.8) : 1;

          return (
            <motion.div
              key={widget.id}
              style={{
                width: isSmallScreen ? 150 : 175,
                height: "100%",
                scale: isSmallScreen ? (isCentered ? 1 : 0.8) : 1,
                zIndex: isCentered ? 1 : 0,
                flexShrink: 0,
                cursor: "pointer",
              }}
              initial={{ scale: isSmallScreen ? 0.8 : 1 }}
              animate={{ scale }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={widget.link}
                style={{ color: "inherit", textDecoration: "inherit" }}
                passHref
              >
                <Card elevation={4} sx={{ cursor: "pointer", height: "100%" }}>
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
      </Stack>
    </Stack>
  );
}

export default DataManagementWidgets;
