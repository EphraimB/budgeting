import { CommuteSystem } from "@/app/types/types";
import { Typography } from "@mui/material";

async function getCommuteSystems(id: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/systems/${id}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute systems");
  }
}

async function CommuteSystemsDetailsPage({
  params,
}: {
  params: { commuteSystemId: string };
}) {
  const commuteSystemId = parseInt(params.commuteSystemId);

  const commuteSystems: CommuteSystem = await getCommuteSystems(
    commuteSystemId
  );

  return (
    <>
      <Typography component="h3" variant="h5">
        {commuteSystems.name} details
      </Typography>
      <br />
    </>
  );
}

export default CommuteSystemsDetailsPage;
