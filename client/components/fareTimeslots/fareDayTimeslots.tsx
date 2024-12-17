import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Timeslot } from "@/app/types/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

interface DayTimeslot {
  startTime: string;
  endTime: string;
}

function FareDayTimeslots({
  timeslot,
  onSave,
  onClose,
}: {
  timeslot: Timeslot[];
  onSave: (timeslots: DayTimeslot[]) => void;
  onClose: () => void;
}) {
  const timeslotsInitial = timeslot.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));

  const [timeslots, setTimeslots] = useState<DayTimeslot[]>(timeslotsInitial);

  const handleTimeChange = (
    index: number,
    field: keyof Timeslot,
    newValue: string | null
  ) => {
    const updatedTimeslots = timeslots.map((slot, i) =>
      i === index ? { ...slot, [field]: newValue } : slot
    );
    setTimeslots(updatedTimeslots);
  };

  const addTimeslot = () => {
    setTimeslots([
      ...timeslots,
      {
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removeTimeslot = (index: number) => {
    setTimeslots(timeslots.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(timeslots);
    onClose();
  };

  return (
    <Box padding={2}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {timeslots.map((timeslot, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={2}
            marginBottom={2}
          >
            <TimePicker
              label="Start Time"
              value={dayjs(timeslot.startTime, "HH:mm:ss")}
              onChange={(newValue) =>
                handleTimeChange(
                  index,
                  "startTime",
                  newValue ? newValue.format("HH:mm:ss") : null
                )
              }
            />
            <TimePicker
              label="End Time"
              value={dayjs(timeslot.endTime, "HH:mm:ss")}
              onChange={(newValue) =>
                handleTimeChange(
                  index,
                  "endTime",
                  newValue ? newValue.format("HH:mm:ss") : null
                )
              }
            />
            <IconButton
              onClick={() => removeTimeslot(index)}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </LocalizationProvider>
      <Button onClick={addTimeslot} variant="outlined" sx={{ marginRight: 1 }}>
        Add Timeslot
      </Button>
      <Button onClick={handleSave} variant="contained" color="primary">
        Save
      </Button>
    </Box>
  );
}

export default FareDayTimeslots;
