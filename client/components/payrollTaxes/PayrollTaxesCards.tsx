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
  payroll_taxes,
}: {
  job: Job;
  payroll_taxes: PayrollTax[];
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
        All {payroll_taxes.length} of your payroll taxes take{" "}
        {payroll_taxes.reduce((acc, current) => acc + current.rate, 0) * 100}%
        of your payroll
      </Typography>
      <Grid container spacing={2}>
        {showPayrollTaxesForm && (
          <Grid key="new-payroll-tax" item>
            <NewPayrollTaxForm
              job_id={job.id}
              setShowPayrollTaxesForm={setShowPayrollTaxesForm}
            />
          </Grid>
        )}
        {payroll_taxes.map((payrollTax: PayrollTax) => (
          <Grid key={payrollTax.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {payrollTaxModes[payrollTax.id] === "delete" ? (
                <PayrollTaxDelete
                  payrollTax={payrollTax}
                  setPayrollTaxModes={setPayrollTaxModes}
                />
              ) : payrollTaxModes[payrollTax.id] === "edit" ? (
                <PayrollTaxEdit
                  job_id={job.id}
                  setPayrollTaxModes={setPayrollTaxModes}
                  payrollTax={payrollTax}
                />
              ) : (
                <PayrollTaxesView
                  payrollTax={payrollTax}
                  setPayrollTaxModes={setPayrollTaxModes}
                  job_id={job.id}
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
