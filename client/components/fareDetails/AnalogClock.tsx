import React from "react";
import { Box } from "@mui/material";
import { Timeslot } from "@/app/types/types";

// Helper to calculate the percentage of time in the day
function calculateTimePercentage(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / 1440) * 100; // Percentage of 24 hours
}

// Generate the conic-gradient for each timeslot
function getRingGradient(
  timeslots: Timeslot[],
  dayOfWeek: number,
  color: string
) {
  const dayTimeslots = timeslots.filter((slot) => slot.dayOfWeek === dayOfWeek);

  if (dayTimeslots.length === 0) return "transparent";

  const segments = dayTimeslots.map((slot) => {
    const startPercent = calculateTimePercentage(slot.startTime);
    const endPercent = calculateTimePercentage(slot.endTime);
    return `${color} ${startPercent}% ${endPercent}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function AnalogClock({
  timeslots,
  dayOfWeek,
  color,
  size,
  tooltipLabel,
}: {
  timeslots: Timeslot[];
  dayOfWeek: number;
  color: string;
  size: string;
  tooltipLabel: string;
}) {
  const gradient = getRingGradient(timeslots, dayOfWeek, color);

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        background: gradient,
        transform: "translate(-50%, -50%)",
        zIndex: dayOfWeek, // To stack them properly
        cursor: "pointer",
      }}
      title={tooltipLabel}
    />
  );
}

export default AnalogClock;
