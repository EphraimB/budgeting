"use client";

import {
  CommuteHistory,
  FareDetail,
  FullCommuteSchedule,
} from "@/app/types/types";
import { Stack, Box, Divider, Typography, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePathname, useRouter } from "next/navigation";
import Grid from "@mui/material/Grid2";
import GeneratedTickets from "./GeneratedTickets";
import CommuteSchedule from "../commuteSchedule/CommuteSchedule";
import { useState } from "react";
import CommuteHistoryTable from "../commuteHistory/CommuteHistoryTable";

export default function CommutePanels({
  fares,
  commuteSchedule,
  commuteHistory,
}: {
  fares: FareDetail[];
  commuteSchedule: FullCommuteSchedule[];
  commuteHistory: CommuteHistory[];
}) {
  const [commuteModes, setCommuteModes] = useState<Record<number, string>>({});

  const router = useRouter();
  const pathname = usePathname();

  const isMobile = useMediaQuery("(max-width:600px)", { noSsr: true });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <Typography
          component="h6"
          variant="h6"
          sx={{
            flexGrow: 1, // Allows this element to take up the remaining space
            textAlign: "center",
          }}
        >
          Commute
        </Typography>
      </Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        divider={
          <Divider
            orientation={isMobile ? "horizontal" : "vertical"}
            flexItem
          />
        }
        spacing={0}
        sx={{
          height: "100vh",
          width: "100%",
        }}
      >
        {/* Panel 1 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack direction="column" spacing={2}>
            <Button
              variant="contained"
              onClick={() => router.push(`${pathname}/setup`)}
            >
              Setup
            </Button>
            <GeneratedTickets fares={fares} commuteSchedule={commuteSchedule} />
          </Stack>
        </Box>

        {/* Panel 2 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h4">Weekly Commute Schedule</Typography>
            </Grid>
            {daysOfWeek.map((day, index) => (
              <Grid key={index} size={{ xs: 12 }}>
                <Typography variant="h5">{day}</Typography>
                {commuteSchedule
                  .filter((schedule) => schedule.dayOfWeek === index)
                  .map((schedule) => (
                    <CommuteSchedule
                      schedule={schedule}
                      commuteModes={commuteModes}
                      setCommuteModes={setCommuteModes}
                    />
                  ))}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Panel 3 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CommuteHistoryTable commuteHistory={commuteHistory} />
        </Box>
      </Stack>
    </>
  );
}
