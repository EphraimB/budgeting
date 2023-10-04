import "./globals.css";
import type { Metadata } from "next";
import GlobalAppBar from "../../components/GlobalAppBar";
import { AlertProvider } from "../../context/AlertContext";
import Alerts from "../../components/Alerts";

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
        <AlertProvider>
          <Alerts />
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
