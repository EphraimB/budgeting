import dayjs from "dayjs";
import DateRange from "../../../components/DateRange";
import TransactionDisplay from "../../../components/TransactionDisplay";
import DataManagementWidgets from "../../../components/DataManagementWidgets";
import customParseFormat from "dayjs/plugin/customParseFormat";

async function getTransactions(
  accountId: number,
  from_date: string,
  to_date: string
) {
  const res = await fetch(
    `http://server:5001/api/transactions?account_id=${accountId}&from_date=${from_date}&to_date=${to_date}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getExpenses(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getTaxes(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getLoans(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/loans?account_id=${accountId}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function TransactionsPage({
  params,
  searchParams,
}: {
  params: { account_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  dayjs.extend(customParseFormat);

  const account_id = parseInt(params.account_id);

  // If no search params are provided, set to the current date for from date and one month from now for to date and change the URL
  if (
    Object.keys(searchParams).length === 0 ||
    dayjs(searchParams.from_date as string, "YYYY-MM-DD", true).isValid() ===
      false ||
    dayjs(searchParams.to_date as string, "YYYY-MM-DD", true).isValid() ===
      false
  ) {
    searchParams = {
      from_date: dayjs().format().split("T")[0],
      to_date: dayjs().add(1, "month").format().split("T")[0],
    };
  }

  const fromDate = searchParams.from_date as string;
  const toDate = searchParams.to_date as string;

  const transactions = await getTransactions(account_id, fromDate, toDate);
  const expenses = await getExpenses(account_id);
  const taxes = await getTaxes(account_id);
  const loans = await getLoans(account_id);

  return (
    <>
      <DataManagementWidgets
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
        loans={loans}
      />
      <br />
      <DateRange fromDate={fromDate} toDate={toDate} />
      <TransactionDisplay transactions={transactions} />
    </>
  );
}

export default TransactionsPage;
