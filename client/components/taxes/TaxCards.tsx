"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import TaxView from "./TaxView";
import TaxEdit from "./TaxEdit";
import NewTaxForm from "./NewTaxForm";
import TaxDelete from "./TaxDelete";
import { Tax } from "@/app/types/types";

function TaxCards({ taxes }: { taxes: Tax[] }) {
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxModes, setTaxModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showTaxForm && (
          <Grid key="new-tax">
            <NewTaxForm setShowTaxForm={setShowTaxForm} />
          </Grid>
        )}

        {taxes.map((tax: Tax) => (
          <Grid key={tax.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {taxModes[tax.id] === "delete" ? (
                <TaxDelete tax={tax} setTaxModes={setTaxModes} />
              ) : taxModes[tax.id] === "edit" ? (
                <TaxEdit tax={tax} setTaxModes={setTaxModes} />
              ) : (
                <TaxView tax={tax} setTaxModes={setTaxModes} />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowTaxForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default TaxCards;
