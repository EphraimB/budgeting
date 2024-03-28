import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PayrollDate } from "@/app/types/types";
import {
  addPayrollDate,
  deletePayrollDate,
} from "../services/actions/payrollDate";
import { useAlert, useSnackbar } from "../context/FeedbackContext";

function PayrollDateCard({
  job_id,
  payroll_date,
  start_day,
  date,
}: {
  job_id: number;
  payroll_date: PayrollDate | null;
  start_day: number;
  date: number;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    job_id,
    start_day,
    end_day: date,
  };

  const handleClick = () => {
    if (payroll_date) {
      try {
        deletePayrollDate(payroll_date.id);

        showSnackbar("Payroll date deleted successfully");
      } catch (error) {
        showAlert("Failed to delete payroll date", "error");
      }
    } else {
      try {
        addPayrollDate(data);

        showSnackbar("Payroll date added successfully");
      } catch (error) {
        showAlert("Failed to add payroll date", "error");
      }
    }
  };
  return (
    <Paper
      elevation={3} // Adds some shadow to the Paper component for better visibility
      sx={{
        p: 2, // Add some padding around the content
        backgroundColor: payroll_date ? "green" : "white", // Change background color based on payroll_date
        position: "relative", // Needed for absolute positioning of the date
        display: "flex", // Use Flexbox for centering
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: 100, // Set a fixed height for the card
      }}
      onClick={handleClick}
    >
      {/* Position the date on the top left */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
        }}
      >
        <Typography variant="caption">{date}</Typography>
      </Box>

      {/* Show a "$" symbol in the middle if there is a payroll_date */}
      {payroll_date && (
        <Typography variant="h5" component="div">
          $
        </Typography>
      )}
    </Paper>
  );
}

export default PayrollDateCard;
