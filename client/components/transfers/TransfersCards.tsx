"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { Account, Transfer } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TransferDelete from "./TransferDelete";
import TransfersView from "./TransfersView";
import NewTransferForm from "./NewTransferForm";
import TransferEdit from "./TransferEdit";

function TransferCards({
  accountId,
  transfers,
  accounts,
}: {
  accountId: number;
  transfers: Transfer[];
  accounts: Account[];
}) {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferModes, setTransferModes] = useState<Record<number, string>>(
    {}
  );

  return (
    <>
      <Grid container spacing={2}>
        {showTransferForm && (
          <Grid key="new-transfer" item>
            <NewTransferForm
              accountId={accountId}
              setShowTransferForm={setShowTransferForm}
              accounts={accounts}
            />
          </Grid>
        )}

        {transfers.map((transfer: Transfer) => (
          <Grid key={transfer.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {transferModes[transfer.id] === "delete" ? (
                <TransferDelete
                  transfer={transfer}
                  setTransferModes={setTransferModes}
                />
              ) : transferModes[transfer.id] === "edit" ? (
                <TransferEdit
                  accountId={accountId}
                  transfers={transfer}
                  setTransferModes={setTransferModes}
                  accounts={accounts}
                />
              ) : (
                <TransfersView
                  accountId={accountId}
                  transfer={transfer}
                  setTransferModes={setTransferModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowTransferForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default TransferCards;
