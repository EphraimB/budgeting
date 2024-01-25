import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Loan } from "@/app/types/types";
import dayjs from "dayjs";

function LoansWidget({
  account_id,
  loans,
}: {
  account_id: number;
  loans: Loan[];
}) {
  function findLatestFullyPaidBackDate(loans: Loan[]) {
    if (loans.length === 0) return null; // Return null if no loans

    // Convert all fully_paid_back dates to Day.js objects and find the max
    let latest = dayjs(loans[0].fully_paid_back);
    loans.forEach((loan: Loan) => {
      const fullyPaidBackDate = dayjs(loan.fully_paid_back);
      if (fullyPaidBackDate.isAfter(latest)) {
        latest = fullyPaidBackDate;
      }
    });

    return latest; // Returns a Day.js object of the most distant date
  }

  const latestFullyPaidBackDate = findLatestFullyPaidBackDate(loans);

  return (
    <Link
      href={`/${account_id}/loans`}
      as={`/${account_id}/loans`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          flexGrow: 1,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/loans.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <CardHeader title="Loans" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body1" color="white">
            You have {loans.length} loan{loans.length === 1 ? "" : "s"} with a
            total of ${loans.reduce((acc, loan) => acc + loan.amount, 0)}.{" "}
            {loans.length === 0
              ? "You are debt free!"
              : latestFullyPaidBackDate
              ? "You will be debt free on " +
                latestFullyPaidBackDate.format("dddd, MMMM D, YYYY h:mm A")
              : ""}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

export default LoansWidget;
