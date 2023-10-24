"use client";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import { useRouter, usePathname } from "next/navigation";

export default function DateRange({
  fromDate,
  toDate,
}: {
  fromDate: string;
  toDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateUrl = (fromDate: string, toDate: string) => {
    const updatedParams = new URLSearchParams();
    updatedParams.set("from_date", fromDate);
    updatedParams.set("to_date", toDate);

    router.push(`${pathname}?${updatedParams.toString()}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <DatePicker
          label="From date"
          value={dayjs(fromDate)}
          onChange={(date) =>
            updateUrl(
              date?.format().split("T")[0] || dayjs().format().split("T")[0],
              toDate
            )
          }
        />
        <DatePicker
          label="To date"
          value={dayjs(toDate)}
          onChange={(date) =>
            updateUrl(
              fromDate,
              date?.format().split("T")[0] ||
                dayjs().add(1, "month").format().split("T")[0]
            )
          }
        />
      </Stack>
    </LocalizationProvider>
  );
}
