"use client";

import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { CommuteSystem } from "@/app/types/types";

export default function CommuteSystemOrbit({
  commuteSystems,
}: {
  commuteSystems: CommuteSystem[];
}) {
  const [selectedSystem, setSelectedSystem] = useState<CommuteSystem | null>(
    null
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden", // Prevent overflow
      }}
    >
      {/* Central Hub */}
      <Box
        sx={{
          position: "absolute",
          top: "50%", // Center vertically within the panel
          left: "50%", // Center horizontally within the panel
          transform: "translate(-50%, -50%)", // Center completely
          width: "10vw", // Adjust size relative to the panel
          height: "10vw",
          maxWidth: "80px", // Cap maximum size
          maxHeight: "80px",
          borderRadius: "50%",
          backgroundColor: "primary.main",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          zIndex: 10,
        }}
      >
        <Typography variant="body2">Hub</Typography>
      </Box>

      {/* Commute Systems */}
      {commuteSystems.map((commuteSystem, index) => {
        const angle = (360 / commuteSystems.length) * index; // Distribute systems evenly
        const radius = "40%"; // Orbit radius relative to the panel size
        const x = `calc(${radius} * ${Math.cos((angle * Math.PI) / 180)})`;
        const y = `calc(${radius} * ${Math.sin((angle * Math.PI) / 180)})`;

        return (
          <Box
            key={commuteSystem.id}
            sx={{
              position: "absolute",
              top: `calc(50% + ${y})`, // Adjust relative to the panel's height
              left: `calc(25% + ${x})`, // Adjust relative to the panel's width
              width: "8vw", // Adjust size relative to the panel
              height: "8vw",
              maxWidth: "60px", // Cap maximum size
              maxHeight: "60px",
              borderRadius: "50%",
              backgroundColor: "grey.300",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "black",
              cursor: "pointer",
              transition: "opacity 0.3s",
              opacity:
                selectedSystem && selectedSystem !== commuteSystem ? 0.5 : 1,
              "&:hover": {
                backgroundColor: "primary.light",
              },
            }}
            onClick={() => setSelectedSystem(commuteSystem)}
          >
            <Typography variant="body2">{commuteSystem.name}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
