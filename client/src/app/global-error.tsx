"use client";

import React from "react";
import { useAlert } from "../../context/FeedbackContext";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { showAlert } = useAlert();

  showAlert(error.message, "error");

  return null;
}
