"use client";

import { PayrollDate } from "@/app/types/types";
import React from "react";
import Grid from "@mui/material/Grid";
import PayrollDateCard from "./PayrollDateCard";

function PayrollDates({
  job_id,
  payroll_dates,
}: {
  job_id: number;
  payroll_dates: PayrollDate[];
}) {
  // Generate an array of numbers from 1 to 31
  const numbers = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
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
              job_id={job_id}
              payroll_date={payrollDateForDay || null}
              date={number}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PayrollDates;
