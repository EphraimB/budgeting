"use client";

import { Job, PayrollTax } from "@/app/types/types";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import NewPayrollTaxForm from "./NewPayrollTaxForm";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";

function PayrollTaxesCards({
  job,
  payroll_taxes,
}: {
  job: Job;
  payroll_taxes: PayrollTax[];
}) {
  const [showPayrollTaxesForm, setShowPayrollTaxesForm] = useState(false);
  return (
    <>
      <Typography variant="h3" component="h2">
        Payroll taxes for {job.name}
      </Typography>
      <br />
      <Grid container spacing={2}>
        {showPayrollTaxesForm && (
          <Grid key="new-payroll-tax" item>
            <NewPayrollTaxForm
              job_id={job.id}
              setShowPayrollTaxesForm={setShowPayrollTaxesForm}
            />
          </Grid>
        )}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowPayrollTaxesForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default PayrollTaxesCards;
