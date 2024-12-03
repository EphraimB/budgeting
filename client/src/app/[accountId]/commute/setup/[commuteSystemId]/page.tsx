import { CommuteStation, CommuteSystem } from "@/app/types/types";
import CommuteStationCards from "../../../../../../components/commuteStation/CommuteStationsCards";
import { Stack, Typography } from "@mui/material";

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

async function CommuteSystemDetails({
  params,
}: {
  params: { commuteSystemId: string };
}) {
  const commuteSystemId = parseInt(params.commuteSystemId);

  const commuteSystem: CommuteSystem = await getCommuteSystemsById(
    commuteSystemId
  );

  const commuteStations: CommuteStation[] = await getCommuteStations(
    commuteSystemId
  );

  return (
    <>
      <Typography component="h2" variant="h2">
        Stations for {commuteSystem.name}
      </Typography>
      <br />
      <br />
      <CommuteStationCards commuteStations={commuteStations} />
    </>
  );
}

export default CommuteSystemDetails;
