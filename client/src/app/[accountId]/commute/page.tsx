import { Card, CardContent, Stack, Typography } from "@mui/material";
import { CommuteOverview } from "@/app/types/types";
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

async function Commute({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const commuteOverview: CommuteOverview[] = await getCommuteOverview(
    accountId
  );

  return (
    <>
      <Typography>
        Total cost per month is ${commuteOverview[0].totalCostPerMonth}
      </Typography>
      <br />
      <CommuteNavTabs />
    </>
  );
}

export default Commute;
