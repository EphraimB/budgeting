"use client";

import React from "react";
import { Job, PayrollDate, PayrollTax } from "@/app/types/types";
import Stack from "@mui/material/Stack";
import { Card, CardContent, Typography } from "@mui/material";
import HourlyWage from "./HourlyWage";
import JobScheduleDayView from "./JobScheduleDayView";
import Link from "next/link";
import { getOrdinalSuffix } from "../../utils/helperFunctions";

function JobDetailsView({
  accountId,
  job,
  payrollDates,
  payrollTaxes,
}: {
  accountId: number;
  job: Job;
  payrollDates: PayrollDate[];
  payrollTaxes: PayrollTax[];
}) {
  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Job Details for {job.name}
      </Typography>
      <br />
      <Stack direction="row" spacing={2} justifyContent="center">
        <HourlyWage hourlyWage={job.hourlyRate} />
      </Stack>
      <br />
      <JobScheduleDayView job={job} />
      <br />
      <Stack
        spacing={2}
        direction="row"
        sx={{
          justifyContent: "center",
        }}
      >
        <Link
          href={`/${accountId}/jobs/${job.id}/dates`}
          as={`/${accountId}/jobs/${job.id}/dates`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Card elevation={1} sx={{ width: 175, overflow: "visible" }}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Payroll dates
              </Typography>
              <Typography>
                {payrollDates.length === 0
                  ? "Click to setup payroll dates"
                  : `You get paid on the ${
                      payrollDates.length === 1
                        ? `${payrollDates[0].payrollDay}${getOrdinalSuffix(
                            payrollDates[0].payrollDay
                          )}`
                        : payrollDates
                            .slice() // Create a copy of the array
                            .sort((a, b) => a.payrollDay - b.payrollDay) // Sort the array
                            .map(
                              (payrollDate) =>
                                `${payrollDate.payrollDay}${getOrdinalSuffix(
                                  payrollDate.payrollDay
                                )}`
                            )
                            .join(", ")
                            .replace(/, ([^,]+)$/, " and $1")
                    } of the month`}
              </Typography>
            </CardContent>
          </Card>
        </Link>
        <Link
          href={`/${accountId}/jobs/${job.id}/taxes`}
          as={`/${accountId}/jobs/${job.id}/taxes`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Card elevation={1} sx={{ width: 175, overflow: "visible" }}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Payroll taxes
              </Typography>
              <Typography>
                All {payrollTaxes.length} of your payroll taxes take{" "}
                {payrollTaxes.reduce((acc, current) => acc + current.rate, 0) *
                  100}
                % of your payroll
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Stack>
    </Stack>
  );
}

export default JobDetailsView;
