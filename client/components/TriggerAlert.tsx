"use client";

import { AlertColor } from "@mui/material";
import { useAlert } from "../context/FeedbackContext";

export default function TriggerAlert({
  message,
  severity,
}: {
  message: string;
  severity: AlertColor | undefined;
}) {
  const { showAlert } = useAlert();

  showAlert(message, severity);
}
