"use client";

import { Stack, Divider, Box } from "@mui/material";
import { CommuteSystem } from "@/app/types/types";
import CommuteSystemCards from "../commuteSystem/CommuteSystemCards";

export default function CommutePanels({
  commuteSystems,
}: {
  commuteSystems: CommuteSystem[];
}) {
  return (
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      spacing={0} // No spacing between panels
      sx={{
        height: "100vh", // Full viewport height
        width: "100%", // Full width of the parent container
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
        <CommuteSystemCards commuteSystems={commuteSystems} />
      </Box>

      {/* Panel 2 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box>
          {/* Placeholder for commute schedule content */}
          Commute schedule Goes Here
        </Box>
      </Box>

      {/* Panel 3 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box>
          {/* Placeholder for commute history content */}
          Commute history Content Goes Here
        </Box>
      </Box>
    </Stack>
  );
}
