import {
  CommuteSchedule,
  FareDetail,
  FullCommuteSchedule,
  Timeslot,
} from "@/app/types/types";
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
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  // Function to check for schedule overlaps
  const isOverlapping = (
    existingSchedule: CommuteSchedule,
    newStartTime: Dayjs,
    newEndTime: Dayjs
  ) => {
    const existingStartTime = dayjs(existingSchedule.startTime, "HH:mm:ss");
    const existingEndTime = dayjs(existingSchedule.endTime, "HH:mm:ss");

    // Check if the new schedule overlaps with the existing schedule
    return (
      // New schedule starts before the existing one ends and ends after the existing one starts
      newStartTime.isBefore(existingEndTime) &&
      newEndTime.isAfter(existingStartTime)
    );
  };

  // Filter valid timeslots based on selected day of the week and start time
  useEffect(() => {
    if (fare.timeslots.length > 0) {
      const filteredTimeslots = fare.timeslots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );

      // Check if the timeslot exists and is valid
      const validSlots = filteredTimeslots.filter((slot) => {
        // Assuming the current selected start time
        const slotStartTime = dayjs(slot.startTime, "HH:mm:ss");
        const slotEndTime = dayjs(slot.endTime, "HH:mm:ss");

        return (
          startTime &&
          dayjs(startTime, "HH:mm:ss").isBetween(
            slotStartTime,
            slotEndTime,
            null,
            "[)"
          )
        );
      });

      // Set the valid slots to state
      setValidTimeslots(validSlots);
    } else {
      setValidTimeslots([]); // Reset if no day is selected or no valid timeslots are found
    }

    // Check if the selected schedule overlaps with any existing schedules
    const isDuplicate = commuteSchedule.some(
      (scheduleGroup) =>
        scheduleGroup.dayOfWeek === dayOfWeek && // Check if it's the same day of the week
        scheduleGroup.commuteSchedules.some((schedule) => {
          const newStartTime = dayjs(startTime || "00:00:00", "HH:mm:ss");
          const newEndTime = newStartTime.add(fare.tripDuration, "minute");

          return isOverlapping(schedule, newStartTime, newEndTime);
        })
    );

    setIsDuplicate(isDuplicate);
  }, [
    dayOfWeek,
    startTime,
    fare.timeslots,
    isDuplicate,
    commuteSchedule,
    fare.tripDuration,
  ]);

  const data = {
    fareDetailId: fare.id,
    dayOfWeek,
    startTime: startTime || "00:00:00",
  };

  const handleAddToSchedule = async () => {
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
          />
        </LocalizationProvider>

        {isDuplicate && (
          <div style={{ color: "red", fontSize: "0.875rem" }}>
            This schedule already exists.
          </div>
        )}

        {validTimeslots.length === 0 && (
          <div style={{ color: "red", fontSize: "0.875rem" }}>
            Fare not valid during this time.
          </div>
        )}
        <Button
          onClick={handleAddToSchedule}
          disabled={validTimeslots.length === 0 || isDuplicate}
        >
          Add to schedule
        </Button>
      </Stack>
    </Modal>
  );
}

export default GeneratedTicketModal;
