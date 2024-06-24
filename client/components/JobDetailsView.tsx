"use client";

import React from "react";
import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Card, CardContent, Paper, Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import SickDays from "./SickDays";
import VacationDays from "./VacationDays";
import JobScheduleDayView from "./JobScheduleDayView";
import Link from "next/link";
import { useParams } from "next/navigation";

function JobDetailsView({ job }: { job: Job }) {
  const account_id = useParams()[0];
  const job_id = useParams()[1];

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
        href={`/${account_id}/jobs/${job_id}/dates`}
        as={`/${account_id}/jobs/${job_id}/dates`}
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
