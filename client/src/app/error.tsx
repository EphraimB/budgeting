"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { useAlert } from "../../context/FeedbackContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { showAlert } = useAlert();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return showAlert("Failed to load accounts", "error");
}
