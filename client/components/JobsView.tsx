"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Job } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import JobActionsMenu from "./JobActionsMenu";
import Link from "next/link";

function JobsView({
  job,
  setJobModes,
  account_id,
}: {
  job: Job;
  setJobModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  account_id: number;
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
        aria-controls={open ? "job-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <JobActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setJobModes={setJobModes}
        job_id={job.id}
      />
      <Link
        href={`/${account_id}/jobs/${job.id}`}
        as={`/${account_id}/jobs/${job.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardHeader title={job.name} />
        <CardContent>
          <Typography variant="body2">
            You get paid ${job.hourly_rate} per hour, and you work{" "}
            {job.total_hours_per_week} hours per week.
          </Typography>
          <br />
          <Typography variant="body2">
            Click to view more details about this job.
          </Typography>
        </CardContent>
      </Link>
    </>
  );
}

export default JobsView;
