import { Timeslot } from "@/app/types/types";
import { Box, Tooltip } from "@mui/material";

function AnalogClock({
  timeslots,
  dayOfWeek,
  lightColor,
  darkColor,
  size,
}: {
  timeslots: Timeslot[];
  dayOfWeek: number;
  lightColor: string;
  darkColor: string;
  size: string;
}) {
  // Get the timeslots for the current day
  const dayTimeslots = timeslots.filter((slot) => slot.dayOfWeek === dayOfWeek);

  // Helper function to calculate the angles for the timeslots
  function getSlotDegrees(timeslots: { startTime: string; endTime: string }[]) {
    let totalDegrees = 0;
    timeslots.forEach((slot) => {
      const start = convertTimeToDegrees(slot.startTime);
      const end = convertTimeToDegrees(slot.endTime);
      totalDegrees += end - start;
    });
    return totalDegrees;
  }

  // Helper function to convert time to degrees (24-hour clock)
  function convertTimeToDegrees(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 1440) * 360; // 1440 minutes in 24 hours
  }

  return (
    <Box
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `10px solid ${lightColor}`, // Outer ring color
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Create a darker ring for the timeslots */}
      <Box
        sx={{
          position: "absolute",
          top: `${dayOfWeek * 10}px`,
          left: `${dayOfWeek * 10}px`,
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `conic-gradient(${darkColor} ${getSlotDegrees(
            dayTimeslots
          )}deg, ${lightColor} 0deg)`,
          mask: "radial-gradient(circle, transparent 85%, black 100%)",
          WebkitMask: "radial-gradient(circle, transparent 85%, black 100%)",
        }}
      >
        {dayTimeslots.map((slot, index) => (
          <Tooltip
            key={index}
            title={`${slot.startTime} - ${slot.endTime}`}
            arrow
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

export default AnalogClock;
