"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { JobSchedule } from "@/app/types/types";

function JobScheduleView({ job_schedule }: { job_schedule: JobSchedule[] }) {}

export default JobScheduleView;
