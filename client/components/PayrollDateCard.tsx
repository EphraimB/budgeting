import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PayrollDate } from "@/app/types/types";

function PayrollDateCard({
  payroll_date,
  date,
}: {
  payroll_date: PayrollDate | null;
  date: number;
}) {
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
    >
      {/* Position the date on the top left */}
      <Box
        sx={{
          position: "absolute",
          top: 8, // Adjust as needed
          left: 8, // Adjust as needed
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
