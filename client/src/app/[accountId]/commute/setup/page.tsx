import { CommuteSystem } from "@/app/types/types";
import CommuteSystemCards from "../../../../../components/commuteSystem/CommuteSystemCards";
import { Typography } from "@mui/material";

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

async function CommuteSetup() {
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();

  return (
    <>
      <Typography component="h2" variant="h6">
        Setup
      </Typography>
      <br />
      <br />
      <CommuteSystemCards commuteSystems={commuteSystems} />
    </>
  );
}

export default CommuteSetup;
