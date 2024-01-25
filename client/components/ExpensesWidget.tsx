import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Expense, Taxes } from "@/app/types/types";

function ExpensesWidget({
  account_id,
  expenses,
  taxes,
}: {
  account_id: number;
  expenses: Expense[];
  taxes: Taxes[];
}) {
  // Function to find tax rate by tax_id
  const getTaxRate = (tax_id: number | null) => {
    if (!tax_id) return 0;

    const tax = taxes.find((tax) => tax.id === tax_id);
    return tax ? tax.rate : 0;
  };

  // Calculate total expenses including taxes
  const totalWithTaxes = expenses.reduce((acc, expense) => {
    const taxRate = getTaxRate(expense.tax_id);
    const taxAmount = expense.amount * taxRate;
    return acc + expense.amount + taxAmount;
  }, 0);

  return (
    <Link
      href={`/${account_id}/expenses`}
      as={`/${account_id}/expenses`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          flexGrow: 1,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/expenses.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <CardHeader title="Expenses" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            You have {expenses.length} expense{expenses.length === 1 ? "" : "s"}{" "}
            with a total of ${totalWithTaxes.toFixed(2)} including taxes.
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ExpensesWidget;
