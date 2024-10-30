import { Typography } from "@mui/material";

async function getCommuteSystems(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/systems?accountId=${accountId}`
    );

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

  return <Typography>Under construction</Typography>;
}

export default Commute;
