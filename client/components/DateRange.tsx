import * as React from "react";
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Stack from "@mui/material/Stack";

export default function DateRange({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: {
  fromDate: Dayjs | null;
  setFromDate: (newValue: Dayjs | null) => void;
  toDate: Dayjs | null;
  setToDate: (newValue: Dayjs | null) => void;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DateTimePicker
          label="From date"
          value={fromDate}
          onChange={(newFromDate) => setFromDate(newFromDate)}
        />
        <DateTimePicker
          label="To date"
          value={toDate}
          onChange={(newToDate) => setToDate(newToDate)}
        />
      </Stack>
    </LocalizationProvider>
  );
}
