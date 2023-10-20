"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { revalidateTag } from "next/cache";

export default function DateRange() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
  const [toDate, setToDate] = useState<Dayjs>(dayjs().add(1, "month"));

  const handleFromDateChange = (date: Dayjs | null) => {
    const updatedParams = new URLSearchParams();
    updatedParams.set("from_date", date ? date.format().split("T")[0] : "");
    updatedParams.set("to_date", toDate.format().split("T")[0]);

    router.push(`${pathname}?${updatedParams.toString()}`);
  };

  const handleToDateChange = (date: Dayjs | null) => {
    const updatedParams = new URLSearchParams();
    updatedParams.set("from_date", fromDate.format().split("T")[0]);
    updatedParams.set("to_date", date ? date.format().split("T")[0] : "");

    router.push(`${pathname}?${updatedParams.toString()}`);

    revalidateTag("date");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DatePicker
          label="From date"
          value={fromDate}
          onChange={handleFromDateChange}
        />
        <DatePicker
          label="To date"
          value={toDate}
          onChange={handleToDateChange}
        />
      </Stack>
    </LocalizationProvider>
  );
}
