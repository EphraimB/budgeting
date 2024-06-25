"use client";

import { Job, PayrollDate } from "@/app/types/types";
import React from "react";
import Grid from "@mui/material/Grid";
import PayrollDateCard from "./PayrollDateCard";
import { Typography } from "@mui/material";

function PayrollDates({
  job,
  payroll_dates,
}: {
  job: Job;
  payroll_dates: PayrollDate[];
}) {
  // Generate an array of numbers from 1 to 31
  const numbers = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <>
      <Typography variant="h3" component="h2">
        Payroll dates for {job.name}
      </Typography>
      <Grid container spacing={2}>
        {numbers.map((number) => {
          // Find the payroll date that matches the current number/day
          const payrollDateForDay = payroll_dates.find(
            (payrollDate) => payrollDate.payroll_day === number
          );

          return (
            <Grid item key={number} xs={6} md={2}>
              <PayrollDateCard
                key={number}
                job_id={job.id}
                payroll_date={payrollDateForDay || null}
                date={number}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

export default PayrollDates;
