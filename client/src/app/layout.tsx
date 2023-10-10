import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import { FeedbackProvider } from "../../context/FeedbackContext";
import Alerts from "../../components/Alerts";
import SnackbarFeedback from "../../components/SnackbarFeedback";
import Container from "@mui/material/Container";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

export default function RootLayout({
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
          <Container maxWidth="lg">{children}</Container>
          <SnackbarFeedback />
        </FeedbackProvider>
      </body>
    </html>
  );
}
