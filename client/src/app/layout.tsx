import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import { FeedbackProvider } from "../../context/FeedbackContext";
import Alerts from "../../components/Alerts";
import SnackbarFeedback from "../../components/SnackbarFeedback";
import Container from "@mui/material/Container";
import AccountList from "../../components/AccountList";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
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
            <Suspense fallback={<Loading />}>
              <AccountList accounts={accounts} />
            </Suspense>
            {children}
          </Container>
          <SnackbarFeedback />
        </FeedbackProvider>
      </body>
    </html>
  );
}
