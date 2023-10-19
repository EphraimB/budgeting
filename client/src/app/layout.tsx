import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import { FeedbackProvider } from "../../context/FeedbackContext";
import Alerts from "../../components/Alerts";
import SnackbarFeedback from "../../components/SnackbarFeedback";
import Container from "@mui/material/Container";
import AccountList from "../../components/AccountList";
import { Suspense } from "react";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accounts = getAccounts();

  console.log("accounts", accounts);

  return (
    <html lang="en">
      <body>
        <GlobalAppBar />
        <FeedbackProvider>
          <Alerts />
          <br />
          <Container maxWidth="lg">
            <Suspense
              fallback={
                <Stack direction="row" justifyContent="center" spacing={2}>
                  <Card
                    sx={{
                      p: 2,
                      width: 175,
                    }}
                  >
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                    <Skeleton variant="text" />
                  </Card>
                  <Card
                    sx={{
                      p: 2,
                      width: 175,
                    }}
                  >
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                    <Skeleton variant="text" />
                  </Card>
                  <Card
                    sx={{
                      p: 2,
                      width: 175,
                    }}
                  >
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                    <Skeleton variant="text" />
                  </Card>
                </Stack>
              }
            >
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
