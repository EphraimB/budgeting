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
  params: {
    accountId: string;
    stationId: string;
    fareDetailId: string;
  };
}) {
  const accountId = parseInt(params.accountId);
  const stationId = parseInt(params.stationId);
  const fareDetailId = parseInt(params.fareDetailId);

  const fareDetail: FareDetail = await getFareDetails(fareDetailId);

  return (
    <>
      <Stack direction="row">
        <Typography component="h2" variant="h2">
          Timeslots for {fareDetail.name}
        </Typography>
      </Stack>
      <br />
      <br />
      <FareTimeslotsDayView
        accountId={accountId}
        stationId={stationId}
        fareDetail={fareDetail}
      />
    </>
  );
}

export default FareTimeslotDetails;
