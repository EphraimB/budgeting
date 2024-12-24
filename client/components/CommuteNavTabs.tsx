"use client";

import { useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CommuteNavTabs({ accountId }: { accountId: number }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Map the last segment of routes to tab indices
    const routeToTabIndex: { [key: string]: number } = {
      "": 0, // Home tab
      setup: 1, // Setup tab
      history: 2, // History tab
    };

    // Match either the "setup" or "history" segment from pathname
    const match = pathname.match(/\/commute\/(setup|history)?/);
    const pathSegment = match ? match[1] || "" : ""; // Extracts "setup", "history", or empty string for root
    setActiveTab(routeToTabIndex[pathSegment] ?? 0);
  }, [pathname]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="commute tabs"
        >
          <Link
            href={`/${accountId}/commute`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Tab label="Home" />
          </Link>
          <Link
            href={`/${accountId}/commute/setup`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Tab label="Setup" />
          </Link>
          <Tab label="History" />
        </Tabs>
      </Box>
    </Box>
  );
}
