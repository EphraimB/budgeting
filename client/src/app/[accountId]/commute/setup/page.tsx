import { CommuteSystem } from "@/app/types/types";
import CommuteSystemCards from "../../../../../components/commute/CommuteSystemCards";

async function getCommuteSystems() {
  try {
    const res = await fetch("http://server:5001/api/expenses/commute/systems");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute systems");
  }
}

async function CommuteSetup() {
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();

  return <CommuteSystemCards commuteSystems={commuteSystems} />;
}

export default CommuteSetup;
