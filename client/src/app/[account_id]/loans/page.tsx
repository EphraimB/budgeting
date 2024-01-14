import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import LoansTable from "../../../../components/LoansTable";

async function getLoans(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/loans?account_id=${accountId}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getTaxes(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?account_id=${accountId}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function Loans({ params }: { params: { account_id: string } }) {
  const accountId = parseInt(params.account_id);

  const loans = await getLoans(accountId);
  const taxes = await getTaxes(accountId);

  return (
    <Stack>
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/back-to-transactions.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <Link
          href={`/${accountId}`}
          as={`/${accountId}`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <CardHeader title="< Transactions" />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="white">
              Go back to transactions.
            </Typography>
          </CardContent>
        </Link>
      </Card>
      <LoansTable account_id={accountId} loans={loans} taxes={taxes} />
    </Stack>
  );
}

export default Loans;
