import dayjs from "dayjs";
import DateRange from "../../../components/DateRange";
import TransactionDisplay from "../../../components/TransactionDisplay";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GeneratedTransaction } from "../types/types";

async function getTransactions(
  account_id: number,
  from_date: string,
  to_date: string
) {
  const res = await fetch(
    `http://server:5001/api/transactions?account_id=${account_id}&from_date=${from_date}&to_date=${to_date}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
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

  const transactions: GeneratedTransaction[] = await getTransactions(
    account_id,
    fromDate,
    toDate
  );

  return (
    <>
      <DateRange fromDate={fromDate} toDate={toDate} />
      <TransactionDisplay transactions={transactions} />
    </>
  );
}

export default TransactionsPage;
