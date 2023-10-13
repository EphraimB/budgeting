import { useState, useEffect } from "react";
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
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";

function ExpensesWidget({ selectedAccountId }: { selectedAccountId: number }) {
  const [expenses, setExpenses] = useState(null) as any[];
  const [loading, setLoading] = useState(true);

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
        showAlert("Failed to load transactions", "error");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, [selectedAccountId]);

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
      id: "Title",
      numeric: false,
      label: "Title",
    },
    {
      id: "description",
      numeric: true,
      label: "Description",
    },
    {
      id: "amount",
      numeric: true,
      label: "Amount ($)",
    },
    {
      id: "carbs",
      numeric: true,
      label: "Carbs (g)",
    },
    {
      id: "protein",
      numeric: true,
      label: "Protein (g)",
    },
  ];

  return (
    <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
      <CardHeader title="Expenses" />
      <CardContent sx={{ flexGrow: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  "aria-label": "select all desserts",
                }}
              />
            </TableCell>
            {headCells.map((headCell: HeadCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.numeric ? "right" : "left"}
                padding={headCell.disablePadding ? "none" : "normal"}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        {loading || !expenses ? (
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Card
              sx={{
                p: 2,
                width: 175,
              }}
            >
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" />
            </Card>
            <Card
              sx={{
                p: 2,
                width: 175,
              }}
            >
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" />
            </Card>
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="Expenses table"
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#000",
                  }}
                >
                  <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Title
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Description
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense: Expense) => (
                  <TableRow
                    key={expense.expense_id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {expense.expense_begin_date}
                    </TableCell>
                    <TableCell align="right">{expense.expense_title}</TableCell>
                    <TableCell align="right">
                      {expense.expense_description}
                    </TableCell>
                    <TableCell align="right">
                      {expense.expense_amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ExpensesWidget;
