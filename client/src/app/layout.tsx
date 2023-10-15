import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import { FeedbackProvider } from "../../context/FeedbackContext";
import Alerts from "../../components/Alerts";
import SnackbarFeedback from "../../components/SnackbarFeedback";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AccountList from "../../components/AccountList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Budgeting app that simulates how you would spend your money.",
};

async function getAccounts() {
  const response = await fetch("http://localhost:3000/api/accounts");
  const data = await response.json();

  return data;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onAccountClick = (account: any) => {
    <Link href={`/transactions/${account.account_id}`}></Link>;
  };

  const accounts = getAccounts();

  return (
    <html lang="en">
      <body>
        <GlobalAppBar />
        <FeedbackProvider>
          <Alerts />
          <Container maxWidth="lg">
            <Box
              sx={{
                mt: 2,
              }}
            >
              <AccountList
                accounts={accounts}
                onAccountClick={onAccountClick}
                selectedAccountId={null}
              />
            </Box>
            {children}
          </Container>
          <SnackbarFeedback />
        </FeedbackProvider>
      </body>
    </html>
  );
}
