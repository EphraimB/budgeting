"use client";

import React, { useEffect, useState } from "react";
import { useAlert } from "../../context/FeedbackContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import dayjs, { Dayjs } from "dayjs";
import AccountList from "../../components/AccountList";
import DateRange from "../../components/DateRange";
import TransactionDisplay from "../../components/TransactionDisplay";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export default function Home() {
  const { showAlert } = useAlert();
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

  const onAccountClick = (account: any) => {
    setSelectedAccountId(account.account_id);
  };

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
  }, [showAlert, accounts]);

  if (loading) return <CircularProgress />; // Show loader while loading is true
  if (!accounts) return null;

  const handleChange = (event: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab);
  };

  return (
    <main>
      <Box
        sx={{
          mt: 2,
        }}
      >
        <AccountList
          accounts={accounts}
          onAccountClick={onAccountClick}
          selectedAccountId={selectedAccountId}
        />
        {selectedAccountId && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs onChange={handleChange} centered>
              <Tab label="Transactions" />
              <Tab label="Manage data" />
            </Tabs>
          </Box>
        )}
        {selectedAccountId && selectedTab == 0 && (
          <>
            <DateRange
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
            {fromDate && toDate && (
              <TransactionDisplay
                accountId={selectedAccountId}
                fromDate={fromDate}
                toDate={toDate}
              />
            )}
          </>
        )}
        {selectedAccountId && selectedTab == 1 && (
          <div>Manage data for account {selectedAccountId}</div>
        )}
      </Box>
    </main>
  );
}
