import AccountDisplay from "../../components/accountDisplay";

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function Home() {
  const accounts = await getAccounts();

  return <AccountDisplay accounts={accounts} />;
}
