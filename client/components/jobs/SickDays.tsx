"use client";

import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

function SickDays({ sick_days }: { sick_days: number }) {
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
        Sick days
      </Typography>
      <Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
        {sick_days}
      </Typography>
    </Box>
  );
}

export default SickDays;
