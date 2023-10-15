"use client";

import * as React from "react";
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";

export default function DateRange({
  from_date,
  to_date,
  handleFromDateChange,
  handleToDateChange,
}: {
  from_date: Dayjs;
  to_date: Dayjs;
  handleFromDateChange: any;
  handleToDateChange: any;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DatePicker
          label="From date"
          value={from_date}
          onChange={handleFromDateChange}
        />
        <DatePicker
          label="To date"
          value={to_date}
          onChange={handleToDateChange}
        />
      </Stack>
    </LocalizationProvider>
  );
}
