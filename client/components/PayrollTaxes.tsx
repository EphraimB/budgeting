"use client";

import { PayrollTax } from "@/app/types/types";
import React from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";

function PayrollTaxes({
  job_id,
  payroll_taxes,
}: {
  job_id: number;
  payroll_taxes: PayrollTax[];
}) {
  return (
    <>
      <Typography variant="h3" component="h2">
        Payroll taxes
      </Typography>
      <Grid container spacing={2}></Grid>
    </>
  );
}

export default PayrollTaxes;
