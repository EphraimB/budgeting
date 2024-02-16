"use client";

import React, { useRef } from "react";
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
import { motion, useAnimation } from "framer-motion";
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

  const controls = useAnimation();
  const refContainer = useRef<HTMLDivElement>(null);

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

  const handleScroll = () => {
    const container = refContainer.current;

    // Check that the container is not null
    if (container) {
      const { scrollLeft, offsetWidth } = container;
      const centerPosition = scrollLeft + offsetWidth / 2;

      widgets.forEach((_, i) => {
        const card = container.children[i];
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const cardCenter = cardLeft + cardWidth / 2;

        const scale =
          1 -
          Math.min(Math.abs(cardCenter - centerPosition) / offsetWidth, 0.2);
        controls.start({
          scale: scale,
          transition: { duration: 0.2 },
        });
      });
    }
  };

  const selectedWidget =
    widgets.find((widget) => widget.selected) || widgets[0];
  const otherWidgets = widgets.filter((w) => w.id !== selectedWidget.id);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const widgetWidth = "25vw"; // Adjust widget width here

  return (
    <Stack spacing={2} sx={{ position: "absolute" }}>
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
      <Box
        ref={refContainer}
        sx={{ display: "flex", overflowX: "scroll" }}
        onScroll={handleScroll}
      >
        {otherWidgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            animate={{
              scale:
                1 -
                Math.min(
                  Math.abs(cardCenter - centerPosition) / offsetWidth,
                  0.2
                ),
              transition: { duration: 0.2 },
            }}
            initial={{ scale: 0.8 }}
          >
            <Link href={widget.link} passHref>
              <Card
                component="a"
                raised
                sx={{ minWidth: 300, cursor: "pointer", m: 1 }}
              >
                <CardContent>
                  <Typography variant="h5">{widget.title}</Typography>
                  <Typography variant="body2">{widget.content}</Typography>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </Box>
    </Stack>
  );
}

export default DataManagementWidgets;
