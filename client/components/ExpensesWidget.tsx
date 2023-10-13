import { useState, useEffect, useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { useAlert } from "../context/FeedbackContext";
import Skeleton from "@mui/material/Skeleton";
import Checkbox from "@mui/material/Checkbox";
import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import EnhancedTableHead from "./EnhancedTableHead";

interface Expense {
  expense_id: number;
  account_id: number;
  tax_id: number;
  expense_amount: number;
  expense_title: string;
  expense_description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number;
  frequency_day_of_week: number;
  frequency_week_of_month: number;
  frequency_month_of_year: number;
  expense_subsidized: number;
  expense_begin_date: string;
  expense_end_date: string | null;
  date_created: string;
  date_modified: string;
}

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "expense_title",
    numeric: false,
    label: "Title",
  },
  {
    id: "expense_description",
    numeric: true,
    label: "Description",
  },
  {
    id: "expense_amount",
    numeric: true,
    label: "Amount ($)",
  },
  {
    id: "expense_begin_date",
    numeric: false,
    label: "Date",
  },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Expenses
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

function ExpensesWidget({ selectedAccountId }: { selectedAccountId: number }) {
  const [expenses, setExpenses] = useState(null) as any[];
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("expense_title");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/expenses?account_id=${selectedAccountId}`
        );
        if (!response.ok) {
          showAlert("Failed to load expenses", "error");
          return;
        }

        const data = await response.json();
        setExpenses(data.data);

        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        showAlert("Failed to load expenses", "error");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, [selectedAccountId]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = expenses.map((n: Expense) => n.expense_title);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - expenses.length) : 0;

  const visibleRows =
    loading || !expenses
      ? null
      : useMemo(
          () =>
            stableSort(expenses, getComparator(order, orderBy)).slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage
            ),
          [order, orderBy, page, rowsPerPage]
        );

  return (
    <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
      <CardHeader title="Expenses" />
      <CardContent sx={{ flexGrow: 1 }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={expenses.length}
              headCells={headCells}
            />
            {/* <TableBody>
              {loading || !expenses || !visibleRows ? (
              ) : (
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(expenses.expense_title);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) =>
                      handleClick(event, expenses.expense_title)
                    }
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={expenses.expense_title}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {expenses.expense_title}
                    </TableCell>
                    <TableCell align="right">
                      {expenses.expense_description}
                    </TableCell>
                    <TableCell align="right">
                      {expenses.expense_amount}
                    </TableCell>
                    <TableCell align="right">
                      {expenses.expense_begin_date}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody> */}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default ExpensesWidget;
