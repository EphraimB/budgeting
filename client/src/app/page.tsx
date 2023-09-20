import Image from "next/image";
import AccountList from "../../components/AccountList";

async function getAccounts() {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    // This will activate the closest `errpor.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const accounts = await getAccounts();

  function onAccountClick(account: any) {
    console.log(account);
  }

  return (
    <main>
      <AccountList accounts={accounts} />
    </main>
  );
}
