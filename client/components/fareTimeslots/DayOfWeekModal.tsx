"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { FareDetail, Timeslot } from "@/app/types/types";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Import plugin for custom parsing
import { editFareDetail } from "../../services/actions/fareDetail";
import TimeslotBar from "./TimeslotBar";
import FareDayTimeslots from "./fareDayTimeslots";
dayjs.extend(customParseFormat);

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#76ff03", // A shade of green for job schedules
    },
    background: {
      default: "#9e9e9e", // A grey color for the background bar
    },
  },
});

const isMobileView = () => {
  return window.innerWidth <= 768; // Adjust threshold as needed for mobile view
};

const is12HourClock = () => {
  const dateTimeFormat = new Intl.DateTimeFormat([], {
    hour: "numeric",
    hour12: true,
  });
  // Format a date at 23:00 to see if 'AM'/'PM' is used in the formatted string
  const formattedTime = dateTimeFormat.format(new Date(0, 0, 0, 23, 0, 0));
  return formattedTime.includes("AM") || formattedTime.includes("PM");
};

const generateHourTicks = () => {
  const ticks = [];
  const use12HourClock = is12HourClock(); // Determine if we should use 12-hour clock
  const mobileView = isMobileView(); // Check if we are in mobile view

  for (let i = 0; i < 24; i++) {
    const showHourLabel = mobileView
      ? i === 0 || i === 12 || i === 23
      : i % 4 === 0;
    let timeString = use12HourClock
      ? dayjs().hour(i).minute(0).format("hA")
      : dayjs().hour(i).minute(0).format("HH");

    ticks.push(
      <Box
        key={i}
        sx={{
          position: "absolute",
          left: `${(100 / 24) * i}%`,
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {showHourLabel && (
          <Typography
            variant="caption"
            sx={{
              color: "black",
              position: "absolute",
              top: "-15px",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: "0.7rem",
            }}
          >
            {timeString}
          </Typography>
        )}
        <Box
          sx={{
            height: "75%",
            width: "1px",
            backgroundColor: showHourLabel ? "black" : "rgba(0,0,0,0.5)",
            position: "absolute",
            top: showHourLabel
              ? mobileView
                ? "3px"
                : "5px"
              : mobileView
              ? "8px"
              : "10px",
          }}
        />
      </Box>
    );
  }
  return ticks;
};

interface DayTimeslot {
  startTime: string;
  endTime: string;
}

function DayOfWeekModal({
  accountId,
  stationId,
  fareDetail,
  scheduleDayOfWeek,
  dayOfWeek,
  open,
  setOpen,
}: {
  accountId: number;
  stationId: number;
  fareDetail: FareDetail;
  scheduleDayOfWeek: Timeslot[];
  dayOfWeek: number;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const onSave = (timeslots: DayTimeslot[]) => {
    try {
      const updatedTimeslot: Timeslot[] = fareDetail.timeslots
        .filter((js) => js.dayOfWeek !== dayOfWeek) // Remove existing entries for the specified day
        .concat(
          timeslots.map((slot) => ({
            // Add updated timeslots for the specified day
            dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );

      editFareDetail(
        {
          accountId,
          stationId,
          name: fareDetail.name,
          fare: fareDetail.fare,
          timeslots: updatedTimeslot,
          alternateFareDetailId: fareDetail.alternateFareDetailId,
        },
        fareDetail.id
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onclose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={onclose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        sx={{ width: "50%", bgcolor: "background.paper", p: 4 }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {days[dayOfWeek]}
        </Typography>

        <FareDayTimeslots
          timeslot={fareDetail.timeslots.filter(
            (js) => js.dayOfWeek === dayOfWeek
          )}
          onSave={onSave}
          onClose={onclose}
        />
        <Box
          sx={{
            width: "100%",
            height: "20px",
            backgroundColor: theme.palette.background.default,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {generateHourTicks()}
          {scheduleDayOfWeek.map((timeslot, index) => (
            <TimeslotBar key={index} timeslot={timeslot} index={index} />
          ))}
        </Box>
      </Stack>
    </Modal>
  );
}

export default DayOfWeekModal;
