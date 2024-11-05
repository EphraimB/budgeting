import { Typography } from "@mui/material";
import CommuteSystemCards from "../../../../components/commute/CommuteSystemCards";
import { CommuteOverview, CommuteSystem } from "@/app/types/types";

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

async function Commute({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const commuteOverview: CommuteOverview = await getCommuteOverview(accountId);
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();

  return (
    <>
      <Typography>
        Total cost per month is ${commuteOverview.totalCostPerMonth}
      </Typography>
      <br />
      <CommuteSystemCards commuteSystems={commuteSystems} />
    </>
  );
}

export default Commute;
