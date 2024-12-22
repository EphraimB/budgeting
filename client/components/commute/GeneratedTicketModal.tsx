import { FareDetail, FullCommuteSchedule, Timeslot } from "@/app/types/types";
import {
  Button,
  MenuItem,
  Modal,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { addCommuteSchedule } from "../../services/actions/commuteSchedule";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { useState, useEffect } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

function GeneratedTicketModal({
  fare,
  commuteSchedule,
  open,
  setOpen,
}: {
  fare: FareDetail;
  commuteSchedule: FullCommuteSchedule[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState<string | null>("00:00:00");
  const [validTimeslots, setValidTimeslots] = useState<Timeslot[]>([]);
  const [minTime, setMinTime] = useState<Dayjs | undefined>(undefined);
  const [maxTime, setMaxTime] = useState<Dayjs | undefined>(undefined);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  // Filter the valid timeslots based on selected day of the week
  useEffect(() => {
    if (dayOfWeek) {
      const filteredTimeslots = fare.timeslots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );
      setValidTimeslots(filteredTimeslots);

      // Get the min and max times for the valid timeslots
      if (filteredTimeslots.length > 0) {
        const times = filteredTimeslots.map((slot) => ({
          start: dayjs(slot.startTime, "HH:mm:ss"),
          end: dayjs(slot.endTime, "HH:mm:ss"),
        }));

        // Calculate the minimum and maximum times using the dayjs array methods
        setMinTime(
          times.reduce(
            (prev, current) =>
              prev.isBefore(current.start) ? prev : current.start,
            times[0].start
          )
        );
        setMaxTime(
          times.reduce(
            (prev, current) => (prev.isAfter(current.end) ? prev : current.end),
            times[0].end
          )
        );
      } else {
        setMinTime(undefined);
        setMaxTime(undefined);
      }

      // Check if the selected startTime already exists in the schedule
      const isDuplicate = commuteSchedule.some(
        (scheduleGroup) =>
          scheduleGroup.dayOfWeek === dayOfWeek && // Check if it's the same day of the week
          scheduleGroup.commuteSchedules.some((schedule) => {
            // Check if the fare pass matches
            if (schedule.fareId === fare.id) {
              const existingStartTime = dayjs(schedule.startTime, "HH:mm:ss");
              const existingEndTime = dayjs(schedule.endTime, "HH:mm:ss");

              const newStartTime = dayjs(startTime || "00:00:00", "HH:mm:ss");
              const newEndTime = newStartTime.add(fare.tripDuration, "minute");

              // Check if the new schedule time overlaps with the existing schedule time
              const isOverlapping =
                // New start time is within the existing time range
                newStartTime.isBetween(
                  existingStartTime,
                  existingEndTime,
                  null,
                  "[)"
                ) ||
                // New end time is within the existing time range
                newEndTime.isBetween(
                  existingStartTime,
                  existingEndTime,
                  null,
                  "(]"
                ) ||
                // Existing start time is within the new time range
                existingStartTime.isBetween(
                  newStartTime,
                  newEndTime,
                  null,
                  "[)"
                ) ||
                // Existing end time is within the new time range
                existingEndTime.isBetween(newStartTime, newEndTime, null, "(]");

              return isOverlapping;
            }
            return false;
          })
      );

      setIsDuplicate(isDuplicate); // Set the duplicate state
    } else {
      setValidTimeslots([]);
      setMinTime(undefined);
      setMaxTime(undefined);
      setIsDuplicate(false);
    }
  }, [dayOfWeek, fare.timeslots, startTime, commuteSchedule]);

  // Check if the selected time is valid
  const isValidTime = (time: string): boolean => {
    const selectedTime = dayjs(time, "HH:mm:ss");
    return minTime && maxTime
      ? selectedTime.isBetween(minTime, maxTime, null, "[]")
      : false;
  };

  const data = {
    fareDetailId: fare.id,
    dayOfWeek,
    startTime: startTime || "00:00:00",
  };

  const handleAddToSchedule = async () => {
    // Ensure startTime is consistently formatted as a dayjs object
    const selectedStartTime = dayjs(startTime || "00:00:00", "HH:mm:ss");

    // Check if the selected schedule is a duplicate
    const isDuplicate = commuteSchedule.some(
      (scheduleGroup) =>
        scheduleGroup.dayOfWeek === dayOfWeek && // Check if it's the same day of the week
        scheduleGroup.commuteSchedules.some(
          (schedule) =>
            schedule.pass === fare.name && // Match the fare pass
            dayjs(schedule.startTime, "HH:mm:ss").isSame(
              selectedStartTime,
              "minute"
            ) // Check for exact time match up to the minute
        )
    );

    if (isDuplicate) {
      showAlert("This schedule already exists.", "error");
      return;
    }

    // Check if the selected time is valid
    if (!isValidTime(startTime || "00:00:00")) {
      showAlert("The selected time is outside the valid fare times", "error");
      return;
    }

    try {
      // Submit the new schedule
      await addCommuteSchedule(data);
      showSnackbar("Successfully added to schedule");
    } catch (error) {
      console.error("Error adding to schedule:", error);
      showAlert("Error adding to schedule", "error");
    }

    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
          {fare.commuteSystemName} {fare.name}
        </Typography>
        <Typography component="p" variant="body2">
          ${fare.fare.toFixed(2)} fare
        </Typography>
        <Select
          label="Day of Week"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          fullWidth
        >
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day, index) => (
            <MenuItem key={index} value={index}>
              {day}
            </MenuItem>
          ))}
        </Select>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="Start Time"
            value={dayjs(startTime, "HH:mm:ss")}
            onChange={(e) => setStartTime(e ? e.format("HH:mm:ss") : null)}
            disabled={!validTimeslots.length} // Disable if no valid timeslots for the selected day
            minTime={minTime}
            maxTime={maxTime}
          />
        </LocalizationProvider>

        {isDuplicate && (
          <div style={{ color: "red", fontSize: "0.875rem" }}>
            This schedule already exists.
          </div>
        )}

        {validTimeslots.length === 0 && (
          <div style={{ color: "red", fontSize: "0.875rem" }}>
            No valid times available for this day.
          </div>
        )}
        <Button
          onClick={handleAddToSchedule}
          disabled={!validTimeslots.length || isDuplicate}
        >
          Add to schedule
        </Button>
      </Stack>
    </Modal>
  );
}

export default GeneratedTicketModal;
