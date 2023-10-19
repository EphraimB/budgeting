"use client"; // Error components must be Client Components

import Alerts from "../../components/Alerts";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Alerts message="Error getting accounts" severity="error" open={true} />
  );
}
