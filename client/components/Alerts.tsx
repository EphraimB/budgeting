"use client"

import * as React from "react";
import Alert from "@mui/material/Alert";

export default function Alerts({
  message,
  severity,
}: {
  message: string;
  severity: "error" | "info" | "success" | "warning";
}) {
  return (
    <Alert severity={severity} onClose={() => {}}>
      {message}
    </Alert>
  );
}
