import { CommuteStation, CommuteSystem } from "@/app/types/types";
import { Typography } from "@mui/material";

async function getCommuteSystem(id: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/systems/${id}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute system");
  }
}

async function getCommuteStationsBySystemId(id: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/stations?commuteSystemId=${id}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute stations");
  }
}

async function getFareDetailsByStationId(id: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/fares?stationId=${id}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch fare details");
  }
}

async function CommuteStationDetails({
  params,
}: {
  params: { commuteStationId: string };
}) {
  const commuteStationId = parseInt(params.commuteStationId);

  const fareDetails = await getFareDetailsByStationId(commuteStationId);

  return (
    <>
      <Typography>Fare details for {fareDetails.name}</Typography>
      <br />
      
    </>
  );
}

export default CommuteStationDetails;