"use client";

import React, { useEffect, useState } from "react";
import AccountDisplay from "../../components/accountDisplay";
import { useAlert } from "../../context/AlertContext";
import CircularProgress from "@mui/material/CircularProgress";

export default function Home() {
  const { showAlert } = useAlert();
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/accounts");
        if (!response.ok) {
          showAlert("Failed to load accounts", "error");
          return;
        }

        const data = await response.json();
        setAccounts(data.data);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        showAlert("Failed to load accounts", "error");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, [showAlert]);

  if (loading) return <CircularProgress />; // Show loader while loading is true
  if (!accounts) return null;

  return (
    <main>
      <AccountDisplay accounts={accounts} />
    </main>
  );
}
