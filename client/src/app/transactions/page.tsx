"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function TransactionsRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the landing page
    router.push("/");
  }, []);

  return null;
}

export default TransactionsRootPage;
