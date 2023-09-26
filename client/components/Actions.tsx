import { useState } from "react";
import { green } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export default function Actions({ accountId }: { accountId: number }) {
  const [value, setValue] = useState(0);

  return (
    <Box
      sx={{
        position: "absolute", // Set to absolute
        top: 25,
        left: 0,
        zIndex: 15, // Ensure it's above the card content
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "50%",
          bgcolor: green[500],
          p: 2,
        }}
      >
        <Tabs
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="transactions"
          centered
        >
          <Tab label="General" />
          <Tab label="Expenses" />
          <Tab label="Loans" />
        </Tabs>
      </Paper>
    </Box>
  );
}
