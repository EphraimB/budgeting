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
  try {
    const res = await fetch(
      `http://server:5001/api/transactions/${accountId}?fromDate=${fromDate}&toDate=${toDate}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch transactions");
  }
}

async function TransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  dayjs.extend(customParseFormat);

  const accountId = parseInt((await params).accountId);

  // Default to the current date and one month from now if no valid searchParams are provided
  let fromDate = dayjs().format("YYYY-MM-DD"); // Default "fromDate" (today)
  let toDate = dayjs().add(1, "month").format("YYYY-MM-DD"); // Default "toDate" (one month later)

  // Check if valid 'fromDate' and 'toDate' exist in the searchParams
  if (
    (await searchParams).fromDate &&
    dayjs((await searchParams).fromDate as string, "YYYY-MM-DD", true).isValid()
  ) {
    fromDate = (await searchParams).fromDate as string; // Use the provided 'fromDate'
  }

  if (
    (await searchParams).toDate &&
    dayjs((await searchParams).toDate as string, "YYYY-MM-DD", true).isValid()
  ) {
    toDate = (await searchParams).toDate as string; // Use the provided 'toDate'
  }

  const generatedTransactions: GeneratedTransaction = await getTransactions(
    accountId,
    fromDate,
    toDate
  );

  return (
    <>
      <DateRange fromDate={fromDate} toDate={toDate} />
      <TransactionDisplay generatedTransactions={generatedTransactions} />
    </>
  );
}

export default TransactionsPage;
