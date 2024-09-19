import dayjs from "dayjs";
import DateRange from "../../../components/DateRange";
import TransactionDisplay from "../../../components/TransactionDisplay";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GeneratedTransaction } from "../types/types";

async function getTransactions(
  accountId: number,
  fromDate: string,
  toDate: string
) {
  const res = await fetch(
    `http://server:5001/api/transactions?accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}`
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
  params: { accountId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  dayjs.extend(customParseFormat);

  const accountId = parseInt(params.accountId);

  // If no search params are provided, set to the current date for from date and one month from now for to date and change the URL
  if (
    Object.keys(searchParams).length === 0 ||
    dayjs(searchParams.fromDate as string, "YYYY-MM-DD", true).isValid() ===
      false ||
    dayjs(searchParams.toDate as string, "YYYY-MM-DD", true).isValid() === false
  ) {
    searchParams = {
      fromDate: dayjs().format().split("T")[0],
      toDate: dayjs().add(1, "month").format().split("T")[0],
    };
  }

  const fromDate = searchParams.fromDate as string;
  const toDate = searchParams.toDate as string;

  const transactions: GeneratedTransaction[] = await getTransactions(
    accountId,
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
