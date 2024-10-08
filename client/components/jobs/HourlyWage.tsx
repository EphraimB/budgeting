"use client";

import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

function HourlyWage({ hourlyWage }: { hourlyWage: number }) {
  return (
    <Box
      sx={{
        backgroundColor: "black",
        color: "white",
        p: 2,
      }}
    >
      <Typography
        variant="body2"
        component="p"
        sx={{ textAlign: "center" }}
        gutterBottom
      >
        Hourly Wage
      </Typography>
      <Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
        ${hourlyWage.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default HourlyWage;
