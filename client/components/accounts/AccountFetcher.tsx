"use client";

import { useEffect, useState } from "react";
import AccountList from "./AccountList"; // Make sure to import AccountList

const AccountFetcher = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/accounts");
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setAccounts(data);
      } catch (error) {
        console.error("Fetch accounts error:", error);
        setError("Failed to fetch accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p>{error}</p>;

  return <AccountList accounts={accounts} />; // Render AccountList with fetched accounts
};

export default AccountFetcher;
