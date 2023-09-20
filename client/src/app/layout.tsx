import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const inter = Inter({ subsets: ["latin"] });

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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Budgeting
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
