import dayjs, { Dayjs } from "dayjs";
import DateRange from "../../../components/DateRange";
import TransactionDisplay from "../../../components/TransactionDisplay";
import DataManagementWidgets from "../../../components/DataManagementWidgets";
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

async function TransactionsPage({
  params,
  searchParams,
}: {
  params: { account_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accountId = parseInt(params.account_id);

  // If no search params are provided, set to the current date for from date and one month from now for to date and change the URL
  if (Object.keys(searchParams).length === 0) {
    searchParams = {
      from_date: dayjs().format().split("T")[0],
      to_date: dayjs().add(1, "month").format().split("T")[0],
    };
  }

  const fromDate = searchParams.from_date as string;
  const toDate = searchParams.to_date as string;

  console.log(searchParams);

  const transactions = await getTransactions(accountId, fromDate, toDate);

  return (
    <>
      <DataManagementWidgets accountId={accountId} />
      <br />
      <DateRange fromDate={fromDate} toDate={toDate} />
      <TransactionDisplay transactions={transactions} />
    </>
  );
}

export default TransactionsPage;
