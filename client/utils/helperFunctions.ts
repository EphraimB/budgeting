import { useMemo } from "react";
import dayjs from "dayjs";

export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export type Order = "asc" | "desc";

export const getComparator = <Key extends keyof any>(
  order: Order,
  orderBy: Key
): ((
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const stableSort = <T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) => {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const handleRequestSort = (
  event: React.MouseEvent<unknown>,
  property: string,
  order: Order, // current order state
  orderBy: string, // current orderBy state
  setOrder: any, // function to set order
  setOrderBy: any // function to set orderBy
) => {
  const isAsc = orderBy === property && order === "asc";
  setOrder(isAsc ? "desc" : "asc");
  setOrderBy(property);
};

export const handleSelectAllClick = (
  event: React.ChangeEvent<HTMLInputElement>,
  row: any[],
  setSelected: any
) => {
  if (event.target.checked) {
    const newSelected = row.map((n: any) => n);
    setSelected(newSelected);
    return;
  }
  setSelected([]);
};

export const handleClick = (
  event: React.MouseEvent<unknown>,
  row: any,
  selected: any[],
  setSelected: any
) => {
  const selectedIndex = selected.findIndex((e) => e.id === row.id);
  let newSelected: any[] = [];

  if (selectedIndex === -1) {
    newSelected = [...selected, row];
  } else if (selectedIndex === 0) {
    newSelected = selected.slice(1);
  } else if (selectedIndex === selected.length - 1) {
    newSelected = selected.slice(0, -1);
  } else if (selectedIndex > 0) {
    newSelected = [
      ...selected.slice(0, selectedIndex),
      ...selected.slice(selectedIndex + 1),
    ];
  }

  setSelected(newSelected);
};

export const handleChangePage = (
  event: unknown,
  newPage: number,
  setPage: any
) => {
  setPage(newPage);
};

export const handleChangeRowsPerPage = (
  event: React.ChangeEvent<HTMLInputElement>,
  setRowsPerPage: any,
  setPage: any
) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

export const isSelected = (id: number, selected: any) =>
  selected.some((row: any) => row.id === id);

export const useVisibleRows = (
  rows: any[],
  order: Order,
  orderBy: string,
  page: number,
  rowsPerPage: number
) => {
  return useMemo(() => {
    return stableSort(rows, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [rows, order, orderBy, page, rowsPerPage]);
};

export const getFrequency = (row: any): string => {
  let expenseFrequency;

  switch (row.frequency_type) {
    case 0: // Daily
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      )
        expenseFrequency = "Daily";
      else expenseFrequency = "Every " + row.frequency_type_variable + " days";

      break;
    case 1: // Weekly
      if (
        row.frequency_type_variable === 1 ||
        row.frequency_type_variable === null
      )
        expenseFrequency = `Weekly ${
          row.frequency_day_of_week !== null
            ? `on ${dayjs(row.begin_date)
                .day(row.frequency_day_of_week)
                .format("dddd")}`
            : ""
        }`;
      else {
        expenseFrequency = `Every ${row.frequency_type_variable}
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
        expenseFrequency = `Monthly on the ${dayOfMonth}${
          dayOfMonth.endsWith("1")
            ? "st"
            : dayOfMonth.endsWith("2")
            ? "nd"
            : dayOfMonth.endsWith("3")
            ? "rd"
            : "th"
        }`;
      } else {
        expenseFrequency = `Every ${
          row.frequency_type_variable
        } months on the ${dayjs(row.begin_date).format("D")}th`;
      }

      if (row.frequency_day_of_month) {
        expenseFrequency = `Monthly on the ${row.frequency_day_of_month}`;
      } else if (row.frequency_day_of_week) {
        expenseFrequency = `Monthly on the ${
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
        expenseFrequency = `Yearly on ${dayjs(row.begin_date).format(
          "MMMM D"
        )}`;
      else
        expenseFrequency = `Every ${
          row.frequency_type_variable
        } years on ${dayjs(row.begin_date).format("MMMM D")}`;

      break;
    default:
      expenseFrequency = "Unknown";
  }

  return expenseFrequency;
};
