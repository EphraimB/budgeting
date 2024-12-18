import { FareDetail } from "@/app/types/types";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { addCommuteSchedule } from "../../services/actions/commuteSchedule";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { useState, useEffect } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

function GeneratedTicketModal({
  fare,
  open,
  setOpen,
}: {
  fare: FareDetail;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState<string | null>("00:00:00");
  const [validTimeslots, setValidTimeslots] = useState<any[]>([]);
  const [minTime, setMinTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [maxTime, setMaxTime] = useState<dayjs.Dayjs | undefined>(undefined);

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
    } else {
      setValidTimeslots([]);
      setMinTime(undefined);
      setMaxTime(undefined);
    }
  }, [dayOfWeek, fare.timeslots]);

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
    // Check if the selected time is valid
    if (!isValidTime(startTime || "00:00:00")) {
      showAlert("The selected time is outside the valid fare times", "error");
      return;
    }

    // Submit data
    try {
      await addCommuteSchedule(data);
      showSnackbar("Successfully added to schedule");
    } catch (error) {
      console.log(error);
      showAlert("Error adding to schedule", "error");
    }
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
      <Card sx={{ maxWidth: "18rem", position: "relative" }}>
        <CardHeader title={`${fare.commuteSystemName} ${fare.name}`} />
        <CardContent>
          <Typography component="p" variant="body2">
            ${fare.fare} fare
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

          {validTimeslots.length === 0 && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              No valid times available for this day.
            </div>
          )}
        </CardContent>
        <CardActionArea>
          <Button
            onClick={handleAddToSchedule}
            disabled={!validTimeslots.length}
          >
            Add to schedule
          </Button>
        </CardActionArea>
      </Card>
    </Modal>
  );
}

export default GeneratedTicketModal;
