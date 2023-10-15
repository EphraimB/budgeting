import DateRange from "../../../../components/DateRange";
import TransactionDisplay from "../../../../components/TransactionDisplay";

function TransactionsPage({ params }: { params: { account_id: string } }) {
  const accountId = parseInt(params.account_id);

  return (
    <>
      <DateRange />
      <TransactionDisplay accountId={accountId} />
    </>
  );
}

export default TransactionsPage;
