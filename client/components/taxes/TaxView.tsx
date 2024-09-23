"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import TaxActionsMenu from "./TaxActionsMenu";
import { Tax } from "@/app/types/types";

function TaxView({
  tax,
  setTaxModes,
}: {
  tax: Tax;
  setTaxModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
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
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <TaxActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setTaxModes={setTaxModes}
        taxId={tax.id}
      />
      <CardHeader title={tax.title} subheader={tax.description} />
      <CardContent>
        <Typography variant="body2">
          Your tax rate is {tax.rate * 100}%
        </Typography>
      </CardContent>
    </>
  );
}

export default TaxView;
