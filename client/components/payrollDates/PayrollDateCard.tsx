import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PayrollDate } from "@/app/types/types";
import { togglePayrollDate } from "../../services/actions/payrollDate";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

function PayrollDateCard({
  jobId,
  payrollDate,
  date,
}: {
  jobId: number;
  payrollDate: PayrollDate | null;
  date: number;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    jobId,
    payrollDay: date,
  };

  const handleClick = async () => {
    try {
      await togglePayrollDate(data);

      showSnackbar("Payroll date toggled successfully");
    } catch (error) {
      showAlert("Failed to toggle payroll date", "error");
    }
  };

  return (
    <Paper
      data-testid="payroll-date-card"
      elevation={3} // Adds some shadow to the Paper component for better visibility
      sx={{
        p: 2, // Add some padding around the content
        backgroundColor: payrollDate ? "green" : "white", // Change background color based on payroll_date
        position: "relative", // Needed for absolute positioning of the date
        display: "flex", // Use Flexbox for centering
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: 100, // Set a fixed height for the card
        cursor: "pointer", // Change cursor to pointer on hover
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
      {payrollDate && (
        <Typography variant="h5" component="div">
          $
        </Typography>
      )}
    </Paper>
  );
}

export default PayrollDateCard;
