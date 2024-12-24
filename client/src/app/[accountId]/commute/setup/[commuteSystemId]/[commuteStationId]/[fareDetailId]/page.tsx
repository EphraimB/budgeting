import { FareDetail } from "@/app/types/types";
import { Stack, Typography } from "@mui/material";
import FareTimeslotsDayView from "../../../../../../../../components/fareTimeslots/FareTimeslotsDayView";

async function getFareDetails(fareDetailId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute/fares/${fareDetailId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch fare details");
  }
}

async function FareTimeslotDetails({
  params,
}: {
  params: Promise<{
    accountId: string;
    commuteSystemId: string;
    commuteStationId: string;
    fareDetailId: string;
  }>;
}) {
  const accountId = parseInt((await params).accountId);
  const commuteSystemId = parseInt((await params).commuteSystemId);
  const stationId = parseInt((await params).commuteStationId);
  const fareDetailId = parseInt((await params).fareDetailId);

  const fareDetail: FareDetail = await getFareDetails(fareDetailId);

  return (
    <>
      <Stack direction="row">
        <Typography component="h2" variant="h2">
          Timeslots for {fareDetail.name} fare
        </Typography>
      </Stack>
      <br />
      <br />
      <FareTimeslotsDayView
        accountId={accountId}
        commuteSystemId={commuteSystemId}
        stationId={stationId}
        fareDetail={fareDetail}
      />
    </>
  );
}

export default FareTimeslotDetails;
