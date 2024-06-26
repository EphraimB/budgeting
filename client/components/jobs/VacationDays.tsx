"use client";

import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

function VacationDays({ vacation_days }: { vacation_days: number }) {
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
        Vacation days
      </Typography>
      <Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
        {vacation_days}
      </Typography>
    </Box>
  );
}

export default VacationDays;
