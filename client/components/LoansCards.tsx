"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { Loan } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

function LoansCards({
  account_id,
  loans,
}: {
  account_id: number;
  loans: Loan[];
}) {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanModes, setLoanModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showLoanForm && (
          <Grid key="new-loan" item>
            <NewLoanForm
              account_id={account_id}
              setShowExpenseForm={setShowLoanForm}
            />
          </Grid>
        )}

        {loans.map((loan: Loan) => (
          <Grid key={loan.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {loanModes[loan.id] === "delete" ? (
                <LoanDelete loan={loan} setLoanModes={setLoanModes} />
              ) : loanModes[loan.id] === "edit" ? (
                <LoanEdit
                  account_id={account_id}
                  loan={loan}
                  setLoanModes={setLoanModes}
                />
              ) : (
                <LoansView
                  loan={loan}
                  loanModes={loanModes}
                  setLoanModes={setLoanModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowLoanForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default LoansCards;
