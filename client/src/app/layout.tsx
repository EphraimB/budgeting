import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import Alerts from "../../components/feedback/Alerts";
import Container from "@mui/material/Container";
import { FeedbackProvider } from "../../context/FeedbackContext";
import SnackbarFeedback from "../../components/feedback/SnackbarFeedback";
import AccountFetcher from "../../components/accounts/AccountFetcher";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalAppBar />
        <FeedbackProvider>
          <Alerts />
          <br />
          <Container maxWidth="lg">
            <AccountFetcher />
            {children}
          </Container>
          <SnackbarFeedback />
        </FeedbackProvider>
      </body>
    </html>
  );
}
