import CommuteSystemOrbit from "../../../../components/commute/CommuteSystemOrbit";
import { CommuteSystem } from "@/app/types/types";

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

async function Commute() {
  const commuteSystems: CommuteSystem[] = await getCommuteSystems();

  return <CommuteSystemOrbit commuteSystems={commuteSystems} />;
}

export default Commute;
