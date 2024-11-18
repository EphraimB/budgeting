"use client";

import { Box, Typography, Card, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid2";
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
    <Box>
      <Grid container spacing={2}>
        {commuteSystems.map((commuteSystem) => (
          <Grid
            size={{ xs: 6 }}
            key={commuteSystem.id}
            sx={{
              opacity:
                selectedSystem && selectedSystem !== commuteSystem ? 0.5 : 1,
              transition: "opacity 0.3s",
            }}
          >
            <Card>
              <CardActionArea onClick={() => setSelectedSystem(commuteSystem)}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={150}
                  bgcolor={
                    selectedSystem === commuteSystem
                      ? "primary.main"
                      : "grey.300"
                  }
                >
                  <Typography color="white">{commuteSystem.name}</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/*selectedSystem && (
        <SystemOrbit
          systemId={selectedSystem}
          onBack={() => setSelectedSystem(null)}
        />
      )*/}
    </Box>
  );
}
