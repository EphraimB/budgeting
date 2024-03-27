import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { JobSchedule } from "@/app/types/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

interface Timeslot {
  startTime: string;
  endTime: string;
}

function JobDayTimeslots({
  job_schedule,
  onSave,
  onClose,
}: {
  job_schedule: JobSchedule[];
  onSave: (timeslots: Timeslot[]) => void;
  onClose: () => void;
}) {
  const timeslotsInitial = job_schedule.map((slot) => ({
    startTime: slot.start_time,
    endTime: slot.end_time,
  }));

  const [timeslots, setTimeslots] = useState<Timeslot[]>(timeslotsInitial);

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

export default JobDayTimeslots;
