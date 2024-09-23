"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { PayrollTax } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import PayrollTaxesActionsMenu from "./PayrollTaxesActionsMenu";

function PayrollTaxesView({
  payrollTax,
  setPayrollTaxModes,
}: {
  payrollTax: PayrollTax;
  setPayrollTaxModes: React.Dispatch<
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
        aria-controls={open ? "payroll-tax-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <PayrollTaxesActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setPayrollTaxModes={setPayrollTaxModes}
        payrollTaxId={payrollTax.id}
      />
      <CardHeader title={payrollTax.name} />
      <CardContent>
        <Typography variant="body2">
          This payroll tax rate is {payrollTax.rate * 100}%
        </Typography>
      </CardContent>
    </>
  );
}

export default PayrollTaxesView;
