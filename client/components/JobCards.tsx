"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import JobsView from "./JobsView";
import JobDelete from "./JobDelete";
import JobEdit from "./JobEdit";
import { Job } from "@/app/types/types";

function JobCards({ jobs }: { jobs: any }) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobModes, setJobModes] = useState<Record<number, string>>({});

  return (
    <>
      <Grid container spacing={2}>
        {showJobForm && (
          <Grid key="new-job" item>
            {/* <NewJobForm setShowJobForm={setShowJobForm} /> */}
          </Grid>
        )}

        {jobs.map((job: Job) => (
          <Grid key={job.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {jobModes[job.id] === "delete" ? (
                <JobDelete job={job} setJobModes={setJobModes} />
              ) : jobModes[job.id] === "edit" ? (
                <JobEdit job={job} setJobModes={setJobModes} />
              ) : (
                <JobsView job={job} setJobModes={setJobModes} />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowJobForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default JobCards;
