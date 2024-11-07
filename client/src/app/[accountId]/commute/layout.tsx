import { Typography } from "@mui/material";
import { CommuteOverview } from "@/app/types/types";
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
