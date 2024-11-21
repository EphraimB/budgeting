"use client";

import { Stack, Box, Divider } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function CommutePanels({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width:600px)", { noSsr: true });

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      divider={
        <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem />
      }
      spacing={0}
      sx={{
        height: "100vh",
        width: "100%",
      }}
    >
      {/* Panel 1 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>

      {/* Panel 2 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Original panel 2 content */}
      </Box>

      {/* Panel 3 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Original panel 3 content */}
      </Box>
    </Stack>
  );
}
