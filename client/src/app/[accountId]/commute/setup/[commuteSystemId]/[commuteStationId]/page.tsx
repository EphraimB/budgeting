import { CommuteStation, CommuteSystem, FareDetail } from "@/app/types/types";
import { Stack, Typography } from "@mui/material";
import FareDetailsCards from "../../../../../../../components/fareDetails/FareDetailsCards";
import { ArrowDownward } from "@mui/icons-material";

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
  params: Promise<{
    accountId: string;
    commuteSystemId: string;
    commuteStationId: string;
  }>;
}) {
  const accountId = parseInt((await params).accountId);
  const commuteSystemId = parseInt((await params).commuteSystemId);
  const commuteStationId = parseInt((await params).commuteStationId);

  const commuteSystem: CommuteSystem = await getCommuteSystemsById(
    commuteSystemId
  );

  const commuteStation: CommuteStation = await getCommuteStations(
    commuteStationId
  );

  const fareDetails: FareDetail[] = await getFareDetails(commuteStationId);

  return (
    <>
      <Stack direction="row">
        <Typography component="h2" variant="h2">
          Fares for {commuteSystem.name}
        </Typography>
        <Stack
          direction="column"
          sx={{
            m: 2,
            border: "1px solid black",
          }}
        >
          <Typography component="p" variant="body2">
            {commuteStation.fromStation}
          </Typography>
          <ArrowDownward />
          <Typography component="p" variant="body2">
            {commuteStation.toStation}
          </Typography>
        </Stack>
      </Stack>
      <br />
      <br />
      <FareDetailsCards
        accountId={accountId}
        commuteSystemId={commuteSystemId}
        commuteStationId={commuteStationId}
        fareDetails={fareDetails}
      />
    </>
  );
}

export default CommuteStationDetails;
