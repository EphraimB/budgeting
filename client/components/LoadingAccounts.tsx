"use client";

import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

function LoadingAccounts() {
  return (
    <Stack direction="row" justifyContent="center" spacing={2}>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
      <Card
        sx={{
          p: 2,
          width: 175,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" />
      </Card>
    </Stack>
  );
}

export default LoadingAccounts;
