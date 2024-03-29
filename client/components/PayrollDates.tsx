"use client";

import { PayrollDate } from "@/app/types/types";
import React from "react";
import Grid from "@mui/material/Grid";
import PayrollDateCard from "./PayrollDateCard";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { editPayrollDate } from "../services/actions/payrollDate";

function PayrollDates({
  job_id,
  payroll_dates,
}: {
  job_id: number;
  payroll_dates: PayrollDate[];
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  // Generate an array of numbers from 1 to 31
  const numbers = Array.from({ length: 31 }, (_, index) => index + 1);

  // Function to find the start day based on the end day of the previous period
  const getStartDay = (currentDay: number) => {
    // Sort payroll dates in descending order of their end days
    const sortedPayrollDates = payroll_dates.sort(
      (a, b) => b.payroll_end_day - a.payroll_end_day
    );

    // Find the first payroll end day that is less than the current day
    const previousPayrollDate = sortedPayrollDates.find(
      (payrollDate) => payrollDate.payroll_end_day < currentDay
    );

    // If found, return the day after the previous payroll end day, otherwise return payroll end day + 1
    return previousPayrollDate
      ? previousPayrollDate.payroll_end_day + 1
      : currentDay + 1;
  };

  const regenerateStartDays = async () => {
    try {
      // Update all payroll dates
      await Promise.all(
        payroll_dates.map(async (payrollDate) => {
          const start_day = getStartDay(payrollDate.payroll_end_day);

          await editPayrollDate(
            {
              job_id,
              start_day,
              end_day: payrollDate.payroll_end_day,
            },
            payrollDate.id
          );
        })
      );

      showSnackbar("Payroll dates successfully updated.");
    } catch (error) {
      showAlert("Failed to update payroll dates.", "error");
    }
  };

  return (
    <Grid container spacing={2}>
      {numbers.map((number) => {
        // Find the payroll date that matches the current number/day
        const payrollDateForDay = payroll_dates.find(
          (payrollDate) => payrollDate.payroll_end_day === number
        );

        const startDay = getStartDay(number);

        return (
          <Grid item key={number} xs={6} md={2}>
            <PayrollDateCard
              key={number}
              job_id={job_id}
              payroll_date={payrollDateForDay || null}
              start_day={startDay}
              regenerateStartDays={regenerateStartDays}
              date={number}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PayrollDates;
