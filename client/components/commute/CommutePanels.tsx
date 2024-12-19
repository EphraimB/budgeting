"use client";

import { FareDetail, FullCommuteSchedule } from "@/app/types/types";
import { Stack, Box, Divider, Typography, Chip, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePathname } from "next/navigation";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import GeneratedTickets from "./GeneratedTickets";

export default function CommutePanels({
  fares,
  commuteSchedule,
}: {
  fares: FareDetail[];
  commuteSchedule: FullCommuteSchedule[];
}) {
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
            <Link href={`${pathname}/setup`}>
              <Button variant="contained">Setup</Button>
            </Link>
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
                    <Grid key={schedule.dayOfWeek} size={{ xs: 12 }}>
                      {schedule.commuteSchedules.map((commute) => (
                        <Grid key={commute.id} size={{ xs: 12 }}>
                          <Box
                            sx={{ backgroundColor: "lightgray", padding: 1 }}
                          >
                            <Typography variant="body1">
                              {commute.pass} - {commute.startTime} to{" "}
                              {commute.endTime} (${commute.fare})
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
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
          {/* Original panel 3 content */}
        </Box>
      </Stack>
    </>
  );
}
