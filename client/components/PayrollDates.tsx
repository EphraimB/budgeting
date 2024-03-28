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

    // If found, return the day after the previous payroll end day, otherwise return 1
    return previousPayrollDate ? previousPayrollDate.payroll_end_day + 1 : 1;
  };

  const regenerateStartDays = () => {
    try {
      // Sort payroll dates in descending order of their end days
      const sortedPayrollDates = payroll_dates.sort(
        (a, b) => b.payroll_end_day - a.payroll_end_day
      );

      // Loop through each payroll date
      sortedPayrollDates.forEach((payrollDate, index) => {
        // If it's the first payroll date, set the start day to 1
        if (index === 0) {
          editPayrollDate(
            {
              job_id,
              start_day: 1,
              end_day: payrollDate.payroll_end_day,
            },
            payrollDate.id
          );
        } else {
          // Otherwise, set the start day to the day after the previous payroll end day
          editPayrollDate(
            {
              job_id,
              start_day: sortedPayrollDates[index - 1].payroll_end_day + 1,
              end_day: payrollDate.payroll_end_day,
            },
            payrollDate.id
          );
        }
      });
      showSnackbar("Start days regenerated successfully");
    } catch (error) {
      showAlert("Failed to regenerate start days", "error");
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
