"use client";

import { Stack, Box, Divider, Typography, Chip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePathname } from "next/navigation";

export default function CommutePanels() {
  const pathname = usePathname();

  const isMobile = useMediaQuery("(max-width:600px)", { noSsr: true });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <Typography
          component="h6"
          variant="h6"
          sx={{
            flexGrow: 1, // Allows this element to take up the remaining space
            textAlign: "center",
          }}
        >
          Drag and drop tickets from the left to the center panel or setup the
          system
        </Typography>
      </Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        divider={
          <Divider
            orientation={isMobile ? "horizontal" : "vertical"}
            flexItem
          />
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
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Chip
              label="Setup"
              component="a"
              href={`${pathname}/setup`}
              variant="outlined"
              clickable
            />
          </Box>
          <br />
          <br />
          <Typography>Tickets will generate based on the setup</Typography>
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
    </>
  );
}
