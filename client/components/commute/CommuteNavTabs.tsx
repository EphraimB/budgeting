"use client";

import { useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CommuteSystemCards from "./CommuteSystemCards";
import { CommuteStation, CommuteSystem } from "@/app/types/types";
import { Close } from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`commute-tabpanel-${index}`}
      aria-labelledby={`commute-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function CommuteNavTabs({
  commuteSystems,
  commuteStations,
}: {
  commuteSystems: CommuteSystem[];
  commuteStations: CommuteStation[];
}) {
  const [value, setValue] = useState(0);

  const [showStations, setShowStations] = useState<number | null>(null);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleStationsClose = () => {
    setShowStations(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="commute tabs">
          <Tab label="Home" {...a11yProps(0)} />
          <Tab label="Setup" {...a11yProps(1)} />
          <Tab label="History" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CommuteSystemCards
          commuteSystems={commuteSystems}
          showStations={showStations}
          setShowStations={setShowStations}
        />
        {showStations && (
          <>
            <Divider />
            <Paper>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography component="h4" variant="h6">
                  Stations for{" "}
                  {
                    commuteSystems
                      .filter(
                        (commuteSystem) => commuteSystem.id === showStations
                      )
                      .map((commuteSystem) => commuteSystem.name) // Adjust property name as needed
                  }
                </Typography>
                <IconButton onClick={handleStationsClose}>
                  <Close />
                </IconButton>
              </Stack>
            </Paper>
          </>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}
