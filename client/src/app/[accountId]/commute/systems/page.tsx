import { Typography } from "@mui/material";
import CommuteSystemCards from "../../../../../components/commute/CommuteSystemCards";
import { CommuteSystem } from "@/app/types/types";

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

async function CommuteSystems() {
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();

  return (
    <>
      <Typography component="h3" variant="h5">
        Commute Systems
      </Typography>
      <br />
      <CommuteSystemCards commuteSystems={commuteSystems} />
    </>
  );
}

export default CommuteSystems;
