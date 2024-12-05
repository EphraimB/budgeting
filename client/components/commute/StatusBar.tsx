"use client";

import { Stack, Typography, IconButton } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ArrowBack, ArrowLeft, Close } from "@mui/icons-material";

export default function StatusBar({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // Regex to match "/[accountId]/setup" exactly with nothing after it
  const isOnRootSetupPage = /^\/[^/]+\/setup\/?$/.test(pathname);

  const goBack = () => {
    const parentPath = pathname.split("/").slice(0, -1).join("/"); // Remove the last segment
    router.push(parentPath); // Navigate to the parent path
  };

  const close = () => {
    const parts = pathname.split("/"); // Split the path into segments
    const accountId = parts[1]; // The first segment is the accountId
    const parentPath = `/${accountId}/commute`; // Create the new path

    router.push(parentPath); // Navigate to the new path
  };

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-around",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <IconButton
        onClick={goBack}
        disabled={isOnRootSetupPage}
        sx={{ color: "white" }}
      >
        <ArrowBack />
      </IconButton>
      <Typography component="h6" variant="h6">
        {title}
      </Typography>
      <IconButton onClick={close} sx={{ color: "white" }}>
        <Close />
      </IconButton>
    </Stack>
  );
}
