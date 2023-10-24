"use client";

import * as React from "react";
import { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import { useAlert } from "../context/FeedbackContext";

export default function Alerts({
  message,
  severity,
  open,
}: {
  message: string;
  severity: AlertColor | undefined;
  open: boolean;
}) {
  return (
    <Alert
      severity={severity}
      // onClose={() => {
      //   closeAlert();
      // }}
    >
      {message}
    </Alert>
  );
}
