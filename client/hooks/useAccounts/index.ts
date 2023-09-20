import { useQuery } from "@tanstack/react-query";

const fetchAccounts = async (limit = 10) => {
  const response = await fetch("http://server:5001/api/accounts");
  const accounts = await response.json();

  return accounts.filter((x: any) => x.id <= limit);
};

const useAccounts = (limit: any) => {
  return useQuery({
    queryKey: ["accounts", limit],
    queryFn: () => fetchAccounts(limit),
  });
};

export { useAccounts, fetchAccounts };
