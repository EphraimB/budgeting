"use client";

import React, { useEffect, useState } from "react";
import { useAlert } from "../../context/FeedbackContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import dayjs, { Dayjs } from "dayjs";
import AccountList from "../../components/AccountList";
import DateRange from "../../components/DateRange";
import TransactionDisplay from "../../components/TransactionDisplay";
import Actions from "../../components/Actions";

export default function Home() {
  const { showAlert } = useAlert();
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);

  // State to keep track of the currently selected account ID
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [isComponentVisible, setComponentVisible] = useState(false);

  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(1, "month"));

  const onAccountClick = (account: any) => {
    if (selectedAccountId === account.account_id) {
      // If the same account is clicked again, toggle the component's visibility
      setComponentVisible(!isComponentVisible);
    } else {
      setSelectedAccountId(account.account_id);
      setComponentVisible(false);
    }
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
        {isComponentVisible && selectedAccountId && (
          <Actions accountId={selectedAccountId} />
        )}
        {selectedAccountId && (
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
      </Box>
    </main>
  );
}
