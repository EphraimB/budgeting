import ExpensesTable from "../../../../components/ExpensesTable";

function Expenses({ params }: { params: { account_id: string } }) {
  const accountId = parseInt(params.account_id);

  return <ExpensesTable accountId={accountId} />;
}

export default Expenses;
