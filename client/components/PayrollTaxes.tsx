"use client";

import { Job, PayrollTax } from "@/app/types/types";
import React from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";

function PayrollTaxes({
  job,
  payroll_taxes,
}: {
  job: Job;
  payroll_taxes: PayrollTax[];
}) {
  return (
    <>
      <Typography variant="h3" component="h2">
        Payroll taxes for {job.name}
      </Typography>
      <Grid container spacing={2}></Grid>
    </>
  );
}

export default PayrollTaxes;
