import { FareDetail, FullCommuteSchedule } from "@/app/types/types";
import CommutePanels from "../../../../components/commute/CommutePanels";

async function getFares() {
  try {
    const res = await fetch("http://server:5001/api/expenses/commute/fares");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch fares");
  }
}

async function getCommuteSchedule() {
  try {
    const res = await fetch("http://server:5001/api/expenses/commute/schedule");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute schedule");
  }
}

async function Commute() {
  const fares: FareDetail[] = await getFares();
  const commuteSchedule: FullCommuteSchedule[] = await getCommuteSchedule();

  return <CommutePanels commuteSchedule={commuteSchedule} fares={fares} />;
}

export default Commute;
