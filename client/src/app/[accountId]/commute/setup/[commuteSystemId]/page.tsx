import { CommuteStation, CommuteSystem } from "@/app/types/types";
import { Typography } from "@mui/material";
import CommuteStationCards from "../../../../../../components/commuteStation/CommuteStationsCards";

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

async function CommuteSetup({
  params,
}: {
  params: { commuteSystemId: string };
}) {
  const commuteSystemId = parseInt(params.commuteSystemId);

  const commuteSystem: CommuteSystem = await getCommuteSystem(commuteSystemId);
  const commuteStations: CommuteStation[] = await getCommuteStationsBySystemId(
    commuteSystem.id
  );

  return (
    <>
      <Typography>Stations for {commuteSystem.name}</Typography>
      <br />
      <CommuteStationCards commuteStations={commuteStations} />
    </>
  );
}

export default CommuteSetup;
