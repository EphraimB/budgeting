import { FareDetail } from "@/app/types/types";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  MenuItem,
  TextField,
} from "@mui/material";
import { addCommuteSchedule } from "../../services/actions/commuteSchedule";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { useState } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function GeneratedTicketView({ fare }: { fare: FareDetail }) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState<string | null>("00:00:00");

  const data = {
    fareDetailId: fare.id,
    dayOfWeek,
    startTime: startTime ? startTime : "00:00:00",
  };

  const handleAddToSchedule = async () => {
    // Submit data
    try {
      await addCommuteSchedule(data);

      // Show success message
      showSnackbar("Successfully added to schedule");
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert("Error adding to schedule", "error");
    }
  };

  return (
    <Card sx={{ maxWidth: "18rem", position: "relative" }}>
      <CardHeader title={`${fare.commuteSystemName} ${fare.name}`} />
      <CardContent>
        <TextField
          select
          label="Day of Week"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          fullWidth
          margin="normal"
        >
          {[
            { value: 1, label: "Monday" },
            { value: 2, label: "Tuesday" },
            { value: 3, label: "Wednesday" },
            { value: 4, label: "Thursday" },
            { value: 5, label: "Friday" },
            { value: 6, label: "Saturday" },
            { value: 7, label: "Sunday" },
          ].map((day) => (
            <MenuItem key={day.value} value={day.value}>
              {day.label}
            </MenuItem>
          ))}
        </TextField>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="Start Time"
            value={dayjs(startTime, "HH:mm:ss")}
            onChange={(e) => setStartTime(e ? e.format("HH:mm:ss") : null)}
          />
        </LocalizationProvider>
      </CardContent>
      <CardActionArea>
        <Button onClick={handleAddToSchedule}>Add to schedule</Button>
      </CardActionArea>
    </Card>
  );
}

export default GeneratedTicketView;
