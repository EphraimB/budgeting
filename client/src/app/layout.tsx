import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import Alerts from "../../components/Alerts";
import Container from "@mui/material/Container";
import AccountList from "../../components/AccountList";
import { Suspense } from "react";
import LoadingAccounts from "../../components/LoadingAccounts";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accounts = await getAccounts();

  return (
    <html lang="en">
      <body>
        <GlobalAppBar />
        <Alerts message="" severity="error" open={false} />
        <Container maxWidth="lg">
          <Suspense fallback={<LoadingAccounts />}>
            <AccountList accounts={accounts} />
          </Suspense>
          {children}
        </Container>
      </body>
    </html>
  );
}
