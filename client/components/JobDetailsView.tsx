"use client";

import React, { useState } from "react";
import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import SickDays from "./SickDays";
import VacationDays from "./VacationDays";
import JobScheduleDayView from "./JobScheduleDayView";

function JobDetailsView({ job }: { job: Job }) {
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
    </Stack>
  );
}

export default JobDetailsView;