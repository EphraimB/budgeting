import { Card, CardContent, Stack, Typography } from "@mui/material";
import {
  CommuteOverview,
  CommuteStation,
  CommuteSystem,
} from "@/app/types/types";
import Link from "next/link";
import CommuteNavTabs from "../../../../components/commute/CommuteNavTabs";

async function getCommuteOverview(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute overview");
  }
}

async function getCommuteSystems() {
  try {
    const res = await fetch("http://server:5001/api/expenses/commute/systems");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute systems");
  }
}

async function getCommuteStations() {
  try {
    const res = await fetch("http://server:5001/api/expenses/commute/stations");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute stations");
  }
}

async function Commute({
  params,
  children,
}: {
  params: { accountId: string };
  children: React.ReactNode;
}) {
  const accountId = parseInt(params.accountId);

  const commuteOverview: CommuteOverview[] = await getCommuteOverview(
    accountId
  );
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();
  const commuteStations: CommuteStation[] = await getCommuteStations();

  return (
    <>
      <Typography>
        Total cost per month is ${commuteOverview[0].totalCostPerMonth}
      </Typography>
      <br />
      <CommuteNavTabs accountId={accountId} />
      <br />
      {children}
    </>
  );
}

export default Commute;
