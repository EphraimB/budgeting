import Image from "next/image";
import AccountList from "../../components/AccountList";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchAccounts } from "../../hooks";

export default function Home() {
  function onAccountClick(account: any) {
    console.log(account);
  }

  return (
    <main>
      <AccountList accounts={getAccounts()} onAccountClick={onAccountClick} />
    </main>
  );
}

export async function getAccounts() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["accounts", 10],
    queryFn: () => fetchAccounts(10),
  });

  return queryClient;
}
