import { CommuteStation, CommuteSystem } from "@/app/types/types";
import { ArrowDownward } from "@mui/icons-material";
import { Card, Paper, Stack, Typography } from "@mui/material";

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

async function getCommuteStationsByStationId(id: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/stations/${id}`
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
  params: { commuteSystemId: string; commuteStationId: string };
}) {
  const commuteSystemId = parseInt(params.commuteSystemId);
  const commuteStationId = parseInt(params.commuteStationId);

  const commuteSystem: CommuteSystem = await getCommuteSystem(commuteSystemId);
  const commuteStation: CommuteStation = await getCommuteStationsByStationId(
    commuteSystem.id
  );
  const fareDetails = await getFareDetailsByStationId(commuteStationId);

  return (
    <>
      <Stack
        spacing={2}
        direction="row"
        sx={{ justifyContent: "center", alignItems: "baseline" }}
      >
        <Typography>Fares for</Typography>
        <Paper
          sx={{
            width: 100,
            height: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            component="h6"
            variant="body1"
            sx={{ fontWeight: "bold" }}
          >
            {commuteSystem.name}
          </Typography>
          <br />
          <Typography component="p" variant="body2">
            {commuteStation.fromStation}
          </Typography>
          <ArrowDownward />
          <Typography component="p" variant="body2">
            {commuteStation.toStation}
          </Typography>
        </Paper>
      </Stack>
      <br />
    </>
  );
}

export default CommuteStationDetails;
