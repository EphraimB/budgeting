import { FareDetail, Timeslot } from "@/app/types/types";
import {
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import { editFareDetail } from "../../services/actions/fareDetail";
import Grid from "@mui/material/Grid2";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { useState } from "react";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FareEditForm = ({
  fareDetail,
  setFareDetailModes,
}: {
  fareDetail: FareDetail;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) => {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const [fareType, setFareType] = useState(fareDetail.name);
  const [fare, setFare] = useState(fareDetail.fare);
  const [timeslots, setTimeslots] = useState(fareDetail.timeslots);

  const [fareTypeError, setFareTypeError] = useState("");
  const [fareError, setFareError] = useState("");

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const validateFareType = () => {
    if (!fareType) {
      setFareTypeError("Fare type is required");

      return false;
    }

    return true;
  };

  const validateFare = () => {
    if (!fare) {
      setFareError("Fare is required");

      return false;
    }

    return true;
  };

  const handleEdit = async () => {
    const isFareTypeValid = validateFareType();
    const isFareValid = validateFare();

    if (isFareTypeValid && isFareValid) {
      // Submit data
      try {
        await editFareDetail(fareDetail, fareDetail.id);

        // Show success message
        showSnackbar(`Fare detail "${fareDetail.name}" edited successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error editing fare detail "${fareDetail.name}"`, "error");
      }

      // Close form
      setFareDetailModes({});
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before editing this fare detail",
        "error"
      );
    }
  };

  return (
    <>
      <TableCell scope="row">
        <TextField
          label="Fare type"
          variant="standard"
          value={fareType}
          error={!!fareTypeError}
          helperText={fareTypeError}
          onChange={(e) => setFareType(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          label="Fare"
          variant="standard"
          value={fare}
          error={!!fareError}
          helperText={fareError}
          onChange={(e) => setFare(parseInt(e.target.value))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            },
          }}
        />
      </TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {timeslots.map((timeslot, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Paper sx={{ padding: 1, textAlign: "center" }}>
                <Select
                  label="Day of Week"
                  value={timeslot.dayOfWeek.toString()}
                  onChange={(event: SelectChangeEvent) => {
                    const newDayOfWeek = parseInt(event.target.value, 10); // Parse to number
                    setTimeslots((prevTimeslots) =>
                      prevTimeslots.map((prevTimeslot, idx) =>
                        idx === index
                          ? { ...prevTimeslot, dayOfWeek: newDayOfWeek }
                          : prevTimeslot
                      )
                    );
                  }}
                >
                  {daysOfWeek.map((dayOfWeek: string, index: number) => {
                    return <MenuItem value={index}>{dayOfWeek}</MenuItem>;
                  })}
                </Select>
                <br />
                <br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimeField
                    label="Start Time"
                    value={dayjs()
                      .hour(parseInt(timeslot.startTime.split(":")[0]))
                      .minute(parseInt(timeslot.startTime.split(":")[1]))}
                    onChange={(newStartTime) => {
                      const startTimeString =
                        newStartTime?.format("HH:mm") ?? ""; // Handle null
                      setTimeslots((prevTimeslots) =>
                        prevTimeslots.map((prevTimeslot, idx) =>
                          idx === index
                            ? { ...prevTimeslot, startTime: startTimeString }
                            : prevTimeslot
                        )
                      );
                    }}
                  />
                  <br />
                  <br />
                  <TimeField
                    label="End Time"
                    value={dayjs()
                      .hour(parseInt(timeslot.endTime.split(":")[0]))
                      .minute(parseInt(timeslot.endTime.split(":")[1]))}
                    onChange={(newEndTime) => {
                      const endTimeString = newEndTime?.format("HH:mm") ?? ""; // Handle null
                      setTimeslots((prevTimeslots) =>
                        prevTimeslots.map((prevTimeslot, idx) =>
                          idx === index
                            ? { ...prevTimeslot, endTime: endTimeString }
                            : prevTimeslot
                        )
                      );
                    }}
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TableCell>
    </>
  );
};

export default FareEditForm;
