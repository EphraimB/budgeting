"use client";

import { FullCommuteSchedule } from "@/app/types/types";
import { Stack, Box, Divider, Typography, Chip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePathname } from "next/navigation";
import Grid from "@mui/material/Grid2";

export default function CommutePanels({
  commuteSchedule,
}: {
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

  const startTime = 8; // 8:00 AM
  const endTime = 18; // 6:00 PM
  const interval = 30; // 30 minutes

  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let i = startTime; i < endTime; i += interval / 60) {
      const hour = Math.floor(i);
      const minute = (i % 1) * 60;
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      timeSlots.push(time);
    }
    return timeSlots;
  };

  const timeslots = generateTimeSlots();

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
          Drag and drop tickets from the left to the center panel or setup the
          system
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
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Chip
              label="Setup"
              component="a"
              href={`${pathname}/setup`}
              variant="outlined"
              clickable
            />
          </Box>
          <br />
          <br />
          <Typography>Tickets will generate based on the setup</Typography>
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
                  .filter((schedule) => schedule.dayOfWeek === index + 1)
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
