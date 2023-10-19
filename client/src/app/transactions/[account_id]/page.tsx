import dayjs, { Dayjs } from "dayjs";
import DateRange from "../../../../components/DateRange";
import TransactionDisplay from "../../../../components/TransactionDisplay";
import DataManagementWidgets from "../../../../components/DataManagementWidgets";

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
}: {
  params: { account_id: string };
}) {
  const accountId = parseInt(params.account_id);

  console.log(dayjs().format().split("T")[0]);

  const transactions = await getTransactions(
    accountId,
    dayjs().format().split("T")[0],
    dayjs().add(1, "month").format().split("T")[0]
  );

  return (
    <>
      <DataManagementWidgets accountId={accountId} />
      <br />
      <DateRange />
      <TransactionDisplay transactions={transactions} />
    </>
  );
}

export default TransactionsPage;
