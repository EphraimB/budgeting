import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import { Timeslot } from "@/app/types/types";
import { createTheme } from "@mui/material/styles";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function TimeslotBar({
  timeslot,
  index,
}: {
  timeslot: Timeslot;
  index: number;
}) {
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

  const timeToPercent = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return ((hours * 60 + minutes) / 1440) * 100;
  };

  return (
    <Tooltip
      key={index}
      title={
        dayjs(timeslot.startTime, "HH:mm:ss").format("h:mm:ss A") +
        "-" +
        dayjs(timeslot.endTime, "HH:mm:ss").format("h:mm:ss A")
      }
      placement="top"
    >
      <Box
        sx={{
          position: "absolute",
          height: "100%",
          backgroundColor: theme.palette.primary.main,
          left: `${timeToPercent(timeslot.startTime)}%`,
          width: `${
            timeToPercent(timeslot.endTime) - timeToPercent(timeslot.startTime)
          }%`,
        }}
        data-testid="timeslot-box"
      />
    </Tooltip>
  );
}

export default TimeslotBar;
