import { CommuteStation, CommuteSystem, FareDetail } from "@/app/types/types";
import { Stack } from "@mui/material";
import FareDetailsCards from "../../../../../../components/fareDetails/FareDetailsCards";

async function getCommuteSystemsById(commuteSystemId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/systems/${commuteSystemId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute system");
  }
}

async function getCommuteStations(commuteStationId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/stations/${commuteStationId}`
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

  const commuteStation: CommuteStation = await getCommuteStations(
    commuteStationId
  );

  const fareDetails: FareDetail[] = await getFareDetails(commuteStationId);

  return (
    <Stack direction="column">
      <FareDetailsCards
        commuteSystemName={commuteSystem.name}
        commuteStation={commuteStation}
        fareDetails={fareDetails}
      />
    </Stack>
  );
}

export default CommuteStationDetails;
