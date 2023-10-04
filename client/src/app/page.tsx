import AccountDisplay from "../../components/accountDisplay";

export default async function Home() {
  const data = await fetch("http://client:3000/accounts");
  if (!data.ok) {
    throw new Error("Failed to fetch data");
  }

  const accounts = await data.json();

  return (
    <main>
      <AccountDisplay accounts={accounts.data} />
    </main>
  );
}
