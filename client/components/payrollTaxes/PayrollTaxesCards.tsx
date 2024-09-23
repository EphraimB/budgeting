"use client";

import { Job, PayrollTax } from "@/app/types/types";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import NewPayrollTaxForm from "./NewPayrollTaxForm";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import PayrollTaxesView from "./PayrollTaxesView";
import PayrollTaxDelete from "./PayrollTaxDelete";
import PayrollTaxEdit from "./PayrollTaxEdit";

function PayrollTaxesCards({
  job,
  payrollTaxes,
}: {
  job: Job;
  payrollTaxes: PayrollTax[];
}) {
  const [showPayrollTaxesForm, setShowPayrollTaxesForm] = useState(false);
  const [payrollTaxModes, setPayrollTaxModes] = useState<
    Record<number, string>
  >({});

  return (
    <>
      <Typography variant="h3" component="h2">
        Payroll taxes for {job.name}
      </Typography>
      <br />
      <Typography variant="h6" component="h3">
        All {payrollTaxes.length} of your payroll taxes take{" "}
        {payrollTaxes.reduce((acc, current) => acc + current.rate, 0) * 100}% of
        your payroll
      </Typography>
      <Grid container spacing={2}>
        {showPayrollTaxesForm && (
          <Grid key="new-payroll-tax" item>
            <NewPayrollTaxForm
              jobId={job.id}
              setShowPayrollTaxesForm={setShowPayrollTaxesForm}
            />
          </Grid>
        )}
        {payrollTaxes.map((payrollTax: PayrollTax) => (
          <Grid key={payrollTax.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {payrollTaxModes[payrollTax.id] === "delete" ? (
                <PayrollTaxDelete
                  payrollTax={payrollTax}
                  setPayrollTaxModes={setPayrollTaxModes}
                />
              ) : payrollTaxModes[payrollTax.id] === "edit" ? (
                <PayrollTaxEdit
                  jobId={job.id}
                  setPayrollTaxModes={setPayrollTaxModes}
                  payrollTax={payrollTax}
                />
              ) : (
                <PayrollTaxesView
                  payrollTax={payrollTax}
                  setPayrollTaxModes={setPayrollTaxModes}
                />
              )}
            </Card>
          </Grid>
        ))}
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
