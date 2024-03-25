"use client";

import React, { useState } from "react";
import { Job } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import SickDays from "./SickDays";
import VacationDays from "./VacationDays";
import JobScheduleDayView from "./JobScheduleDayView";
import { motion } from "framer-motion";

function JobDetailsView({ job }: { job: Job }) {
  const [scheduleIsExpanded, setScheduleIsExpanded] = useState<number | null>(
    null
  );

  return (
    <Stack sx={{ position: "relative" }}>
      <Typography variant="h4" component="h2">
        Job Details for {job.name}
      </Typography>
      <br />
      <motion.div
        style={{ position: "relative" }}
        initial={false}
        animate={{ filter: scheduleIsExpanded ? "blur(4px)" : "none" }}
      >
        <Stack direction="row" spacing={2} justifyContent="center">
          <HourlyWage hourly_wage={job.hourly_rate} />
          <SickDays sick_days={job.sick_days} />
          <VacationDays vacation_days={job.vacation_days} />
        </Stack>
        <br />
        <JobScheduleDayView
          job_schedule={job.job_schedule}
          scheduleIsExpanded={scheduleIsExpanded}
          setScheduleIsExpanded={setScheduleIsExpanded}
        />
      </motion.div>
    </Stack>
  );
}

export default JobDetailsView;
