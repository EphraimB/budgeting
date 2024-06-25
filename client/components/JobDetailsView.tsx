"use client";

import React from "react";
import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Card, CardContent, Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import SickDays from "./SickDays";
import VacationDays from "./VacationDays";
import JobScheduleDayView from "./JobScheduleDayView";
import Link from "next/link";

function JobDetailsView({ account_id, job }: { account_id: number; job: Job }) {
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
          </CardContent>
        </Card>
      </Link>
    </Stack>
  );
}

export default JobDetailsView;
