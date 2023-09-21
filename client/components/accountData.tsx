import AccountDisplay from "./accountDisplay";

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function AccountData() {
  const accounts = await getAccounts();
  return <AccountDisplay accounts={accounts} />;
}
