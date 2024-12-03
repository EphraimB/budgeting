import { CommuteSchedule, FullCommuteSchedule } from "@/app/types/types";
import CommutePanels from "../../../../components/commute/CommutePanels";

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
  const commuteSchedule: FullCommuteSchedule[] = await getCommuteSchedule();

  return <CommutePanels commuteSchedule={commuteSchedule} />;
}

export default Commute;
