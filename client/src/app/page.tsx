"use client";

import React, { useEffect, useState } from "react";
import { useAlert } from "../../context/FeedbackContext";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import dayjs, { Dayjs } from "dayjs";
import AccountList from "../../components/AccountList";
import DateRange from "../../components/DateRange";
import TransactionDisplay from "../../components/TransactionDisplay";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DataManagementWidgets from "../../components/DataManagementWidgets";

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
        const response = await fetch("http://localhost:3000/api/accounts");
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
        {loading || !accounts ? (
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
        ) : (
          <AccountList
            accounts={accounts}
            onAccountClick={onAccountClick}
            selectedAccountId={selectedAccountId}
          />
        )}
        {selectedAccountId && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={selectedTab} onChange={handleChange}>
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
          <DataManagementWidgets selectedAccountId={selectedAccountId} />
        )}
      </Box>
    </main>
  );
}
