"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { Income, Tax } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import IncomeView from "./IncomeView";
import IncomeDelete from "./IncomeDelete";
import NewIncomeForm from "./NewIncomeForm";
import IncomeEdit from "./IncomeEdit";

function IncomeCards({
  accountId,
  incomes,
  taxes,
}: {
  accountId: number;
  incomes: Income[];
  taxes: Tax[];
}) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeModes, setIncomeModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showIncomeForm && (
          <Grid key="new-income">
            <NewIncomeForm
              accountId={accountId}
              taxes={taxes}
              setShowIncomeForm={setShowIncomeForm}
            />
          </Grid>
        )}

        {incomes.map((income: Income) => (
          <Grid key={income.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {incomeModes[income.id] === "delete" ? (
                <IncomeDelete income={income} setIncomeModes={setIncomeModes} />
              ) : incomeModes[income.id] === "edit" ? (
                <IncomeEdit
                  accountId={accountId}
                  income={income}
                  taxes={taxes}
                  setIncomeModes={setIncomeModes}
                />
              ) : (
                <IncomeView
                  income={income}
                  taxes={taxes}
                  setIncomeModes={setIncomeModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowIncomeForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default IncomeCards;
