import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import Alerts from "../../components/Alerts";
import Container from "@mui/material/Container";
import AccountList from "../../components/AccountList";
import { FeedbackProvider, useAlert } from "../../context/FeedbackContext";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    // open alert
    // showAlert("Failed to fetch accounts", "error");
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
        <FeedbackProvider>
          <Alerts />
          <br />
          <Container maxWidth="lg">
            <AccountList accounts={accounts} />
            {children}
          </Container>
        </FeedbackProvider>
      </body>
    </html>
  );
}
