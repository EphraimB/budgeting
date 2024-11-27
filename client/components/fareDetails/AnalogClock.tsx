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
  // Helper function to convert time to degrees (24-hour clock)
  function convertTimeToDegrees(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 1440) * 360; // 1440 minutes in 24 hours
  }

  // Get the timeslots for the current day
  const dayTimeslots = timeslots.filter((slot) => slot.dayOfWeek === dayOfWeek);

  return (
    <Box
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
      }}
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
          border: `10px solid ${lightColor}`, // Outer ring color
        }}
      />
      {dayTimeslots.map((slot, index) => {
        const startAngle = convertTimeToDegrees(slot.startTime) - 90; // Adjust start angle
        const endAngle = convertTimeToDegrees(slot.endTime) - 90; // Adjust end angle

        return (
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
                "::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: `conic-gradient(from ${startAngle}deg at 50% 50%, ${darkColor} ${startAngle}deg, transparent ${startAngle}deg ${endAngle}deg, ${darkColor} ${endAngle}deg)`,
                },
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default AnalogClock;
