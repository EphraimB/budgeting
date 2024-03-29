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

  const regenerateStartDays = async (newPayrollDate: PayrollDate | null) => {
    try {
      if (!newPayrollDate) return;

      let updatedPayrollDates = [...payroll_dates];

      // Insert the new payroll date in the correct position based on end_day
      const insertionIndex = updatedPayrollDates.findIndex(
        (pd) => pd.payroll_end_day > newPayrollDate.payroll_end_day
      );
      if (insertionIndex >= 0) {
        updatedPayrollDates.splice(insertionIndex, 0, newPayrollDate);
      } else {
        updatedPayrollDates.push(newPayrollDate); // Add to the end if it's the latest
      }

      // Adjust the end_day of the payroll period immediately before the new date
      if (insertionIndex > 0) {
        const previousDate = updatedPayrollDates[insertionIndex - 1];
        if (previousDate.payroll_end_day >= newPayrollDate.payroll_start_day) {
          await editPayrollDate(
            {
              job_id: previousDate.job_id,
              start_day: previousDate.payroll_start_day, // Ensure this matches the expected property name
              end_day: newPayrollDate.payroll_start_day - 1,
            },
            previousDate.id
          );
        }
      }

      // Adjust the start_day of the payroll period immediately after the new date
      if (insertionIndex < updatedPayrollDates.length - 1) {
        const nextDate = updatedPayrollDates[insertionIndex + 1];
        await editPayrollDate(
          {
            job_id: nextDate.job_id,
            start_day: newPayrollDate.payroll_end_day + 1, // Ensure this matches the expected property name
            end_day: nextDate.payroll_end_day,
          },
          nextDate.id
        );
      }

      showSnackbar("Payroll dates updated successfully.");
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
