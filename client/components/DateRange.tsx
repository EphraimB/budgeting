"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Stack from "@mui/material/Stack";
import { useSearchParams } from "next/navigation";

export default function DateRange() {
  const searchParams = useSearchParams();

  const from_date = dayjs(searchParams.get("from_date")) || dayjs();
  const to_date = dayjs(searchParams.get("to_date")) || dayjs();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DateTimePicker label="From date" value={from_date} />
        <DateTimePicker label="To date" value={to_date} />
      </Stack>
    </LocalizationProvider>
  );
}
