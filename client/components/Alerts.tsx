"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import { useAlert } from "../context/FeedbackContext";

export default function Alerts() {
  const { alert, closeAlert } = useAlert();

  return (
    alert.open && (
      <Alert
        severity={alert.severity}
        onClose={() => {
          closeAlert();
        }}
      >
        {alert.message}
      </Alert>
    )
  );
}
