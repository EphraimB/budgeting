"use client";

import * as React from "react";
import Alert, { AlertColor } from "@mui/material/Alert";
import { useAlert } from "../context/AlertContext";

export default function Alerts() {
  const { alert, closeAlert } = useAlert();

  if (!alert.open) return null;

  return (
    <Alert
      severity={alert.severity}
      onClose={() => {
        closeAlert();
      }}
    >
      {alert.message}
    </Alert>
  );
}
