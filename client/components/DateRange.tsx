"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DateRange() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from_date = searchParams.get("from_date")
    ? dayjs(searchParams.get("from_date"))
    : dayjs();
  const to_date = searchParams.get("to_date")
    ? dayjs(searchParams.get("to_date"))
    : dayjs();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const handleFromDateChange = (date: Dayjs | null) => {
    router.push(
      pathname +
        "?" +
        createQueryString(
          "from_date",
          date ? date.format().split("T")[0] : dayjs().format().split("T")[0]
        ) +
        "&" +
        createQueryString(
          "to_date",
          to_date
            ? to_date.format().split("T")[0]
            : dayjs().format().split("T")[0]
        )
    );
  };

  const handleToDateChange = (date: Dayjs | null) => {
    router.push(
      pathname +
        "?" +
        createQueryString(
          "from_date",
          from_date
            ? from_date.format().split("T")[0]
            : dayjs().format().split("T")[0]
        ) +
        "&" +
        createQueryString(
          "to_date",
          date ? date.format().split("T")[0] : dayjs().format().split("T")[0]
        )
    );
  };

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
