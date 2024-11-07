"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CommuteStation } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import { ArrowDownward } from "@mui/icons-material";
import { Stack } from "@mui/material";
import CommuteStationActionsMenu from "./CommuteStationActionsMenu";

function CommuteStationView({
  commuteStation,
  setCommuteStationModes,
}: {
  commuteStation: CommuteStation;
  setCommuteStationModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleClick}
        aria-controls={open ? "commute-station-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <CommuteStationActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setCommuteStationModes={setCommuteStationModes}
        commuteStationId={commuteStation.id}
      />
      <CardContent>
        <Stack direction="row">
          <Stack direction="column">
            <Typography variant="body2">
              {commuteStation.fromStation}
            </Typography>
            <ArrowDownward />
            <Typography variant="body2">{commuteStation.toStation}</Typography>
          </Stack>
          <Typography variant="body1">{commuteStation.tripDuration}</Typography>
        </Stack>
      </CardContent>
    </>
  );
}

export default CommuteStationView;