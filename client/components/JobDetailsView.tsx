"use client";

import React from "react";
import { Job, PayrollDate } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Card, CardContent, Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import SickDays from "./SickDays";
import VacationDays from "./VacationDays";
import JobScheduleDayView from "./JobScheduleDayView";
import Link from "next/link";
import { getOrdinalSuffix } from "../utils/helperFunctions";

function JobDetailsView({
  account_id,
  job,
  payroll_dates,
}: {
  account_id: number;
  job: Job;
  payroll_dates: PayrollDate[];
}) {
  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Job Details for {job.name}
      </Typography>
      <br />
      <Stack direction="row" spacing={2} justifyContent="center">
        <HourlyWage hourly_wage={job.hourly_rate} />
        <SickDays sick_days={job.sick_days} />
        <VacationDays vacation_days={job.vacation_days} />
      </Stack>
      <br />
      <JobScheduleDayView job={job} />
      <br />
      <Stack
        direction="row"
        sx={{
          justifyContent: "center",
        }}
      >
        <Link
          href={`/${account_id}/jobs/${job.id}/dates`}
          as={`/${account_id}/jobs/${job.id}/dates`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Card elevation={1} sx={{ width: 175, overflow: "visible" }}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Payroll dates
              </Typography>
              <Typography>
                You get paid on the{" "}
                {payroll_dates.length === 1
                  ? `${payroll_dates[0].payroll_day}${getOrdinalSuffix(
                      payroll_dates[0].payroll_day
                    )}`
                  : payroll_dates
                      .map((payrollDate, index) => {
                        return `${payrollDate.payroll_day}${getOrdinalSuffix(
                          payrollDate.payroll_day
                        )}`;
                      })
                      .join(", ")
                      .replace(/, ([^,]+)$/, " and $1")}{" "}
                of the month.
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Stack>
    </Stack>
  );
}

export default JobDetailsView;
