"use client";

import { useState } from "react";
import CardContent from "@mui/material/CardContent";
import { FareDetail } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import { Box } from "@mui/material";
import FareDetailActionsMenu from "./FareDetailActionsMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";

function FareDetailView({
  fareDetail,
  setFareDetailModes,
}: {
  fareDetail: FareDetail;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const pathname = usePathname();

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
        aria-controls={open ? "fare-detail-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <FareDetailActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setFareDetailModes={setFareDetailModes}
        fareDetailId={fareDetail.id}
      />
      <Link
        href={`${pathname}/${fareDetail.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardContent>
          <Box>
            <strong>{fareDetail.name}</strong>
          </Box>
          <Box>${fareDetail.fare}</Box>
        </CardContent>
      </Link>
    </>
  );
}

export default FareDetailView;
