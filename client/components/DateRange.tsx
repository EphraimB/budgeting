"use client";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import { useRouter, usePathname } from "next/navigation";
import { revalidateTag } from "next/cache";

export default function DateRange({
  fromDate,
  toDate,
}: {
  fromDate: string;
  toDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleFromDateChange = (date: Dayjs | null) => {
    const updatedParams = new URLSearchParams();
    updatedParams.set(
      "from_date",
      date ? date.format().split("T")[0] : dayjs().format().split("T")[0]
    );
    updatedParams.set(
      "to_date",
      toDate ? toDate : dayjs().add(1, "month").format().split("T")[0]
    );

    router.push(`${pathname}?${updatedParams.toString()}`);
  };

  const handleToDateChange = (date: Dayjs | null) => {
    const updatedParams = new URLSearchParams();
    updatedParams.set(
      "from_date",
      fromDate ? fromDate : dayjs().format().split("T")[0]
    );
    updatedParams.set(
      "to_date",
      date
        ? date.format().split("T")[0]
        : dayjs().add(1, "month").format().split("T")[0]
    );

    router.push(`${pathname}?${updatedParams.toString()}`);

    revalidateTag("date");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DatePicker
          label="From date"
          value={dayjs(fromDate)}
          onChange={handleFromDateChange}
        />
        <DatePicker
          label="To date"
          value={dayjs(toDate)}
          onChange={handleToDateChange}
        />
      </Stack>
    </LocalizationProvider>
  );
}
