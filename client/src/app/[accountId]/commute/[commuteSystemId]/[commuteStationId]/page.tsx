import { CommuteStation, CommuteSystem, FareDetail } from "@/app/types/types";
import { Stack } from "@mui/material";

async function getCommuteSystemsById(id: number) {
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

async function getCommuteStations(commuteSystemId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/stations?commuteSystemId=${commuteSystemId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute stations");
  }
}

async function getFareDetails(commuteStationId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/fares?stationId=${commuteStationId}`
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
  params: { commuteSystemId: string; commuteStationId: string };
}) {
  const commuteSystemId = parseInt(params.commuteSystemId);
  const commuteStationId = parseInt(params.commuteStationId);

  const commuteSystem: CommuteSystem = await getCommuteSystemsById(
    commuteSystemId
  );

  const commuteStations: CommuteStation[] = await getCommuteStations(
    commuteSystemId
  );

  const fareDetails: FareDetail[] = await getFareDetails(commuteStationId);

  return <Stack direction="column"></Stack>;
}

export default CommuteStationDetails;
