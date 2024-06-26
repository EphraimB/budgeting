"use client";

import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import { useSnackbar } from "../../context/FeedbackContext";

export default function SnackbarFeedback() {
  const { snackbar, closeSnackbar } = useSnackbar();

  if (!snackbar.open) return null;

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => {
        closeSnackbar();
      }}
      message={snackbar.message}
    />
  );
}
