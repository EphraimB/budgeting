import dayjs from "dayjs";

export const getFrequency = (row: any): string => {
  let expenseFrequency;

  switch (row.frequency_type) {
    case 0: // Daily
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      )
        expenseFrequency = "daily";
      else expenseFrequency = "every " + row.frequency_type_variable + " days";

      break;
    case 1: // Weekly
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      )
        expenseFrequency = `weekly ${
          row.frequency_day_of_week !== null
            ? `on ${dayjs(row.begin_date)
                .day(row.frequency_day_of_week)
                .format("dddd")}`
            : ""
        }`;
      else {
        expenseFrequency = `every ${row.frequency_type_variable}
          weeks ${
            row.frequency_day_of_week !== null
              ? `on ${dayjs(
                  dayjs(row.begin_date).day(row.frequency_day_of_week)
                ).format("dddd")}`
              : ""
          }`;
      }

      break;
    case 2: // Monthly
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      ) {
        const dayOfMonth = dayjs(row.begin_date).format("D");
        expenseFrequency = `monthly on the ${dayOfMonth}${
          dayOfMonth.endsWith("1")
            ? "st"
            : dayOfMonth.endsWith("2")
            ? "nd"
            : dayOfMonth.endsWith("3")
            ? "rd"
            : "th"
        }`;
      } else {
        const dayOfMonth = dayjs(row.begin_date).format("D");
        expenseFrequency = `every ${
          row.frequency_type_variable
        } months on the ${dayOfMonth}${
          dayOfMonth.endsWith("1")
            ? "st"
            : dayOfMonth.endsWith("2")
            ? "nd"
            : dayOfMonth.endsWith("3")
            ? "rd"
            : "th"
        }`;
      }

      if (row.frequency_day_of_month) {
        expenseFrequency = `monthly on the ${row.frequency_day_of_month}`;
      } else if (row.frequency_day_of_week) {
        expenseFrequency = `monthly on the ${
          row.frequency_week_of_month === 0
            ? "first"
            : row.frequency_week_of_month === 1
            ? "second"
            : row.frequency_week_of_month === 2
            ? "third"
            : row.frequency_week_of_month === 3
            ? "fourth"
            : "last"
        } ${dayjs(row.frequency_day_of_week).format("dddd")}`;
      }

      break;
    case 3: // Yearly
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      )
        expenseFrequency = `yearly on ${dayjs(row.begin_date).format(
          "MMMM D"
        )}`;
      else
        expenseFrequency = `every ${
          row.frequency_type_variable
        } years on ${dayjs(row.begin_date).format("MMMM D")}`;

      break;
    default:
      expenseFrequency = "Unknown";
  }

  return expenseFrequency;
};
