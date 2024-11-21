import { CommuteStation } from "@/app/types/types";
import CommuteStationCards from "../../../../../components/commuteStation/CommuteStationsCards";

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

  const commuteSystems: CommuteStation[] = await getCommuteStations(
    commuteSystemId
  );

  return <CommuteStationCards commuteStations={commuteSystems} />;
}

export default CommuteSystemDetails;
