"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from "react";

import { AlertColor } from "@mui/material/Alert";

type Alert = {
  message: string;
  severity: AlertColor | undefined;
  open: boolean;
};

type Snackbar = {
  message: string;
  open: boolean;
};

type FeedbackContextProps = {
  alert: Alert;
  showAlert: (message: string, severity: AlertColor | undefined) => void;
  closeAlert: () => void;
  snackbar: Snackbar;
  showSnackbar: (message: string) => void;
  closeSnackbar: () => void;
  accounts: any[];
  accountsLoading: boolean;
  fetchAccounts: () => void;
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
  expenses: any[];
  expensesLoading: boolean;
  fetchExpenses: () => void;
};

const defaultAlert: Alert = {
  message: "",
  severity: undefined,
  open: false,
};

const FeedbackContext = createContext<FeedbackContextProps | undefined>(
  undefined
);

type FeedbackProviderProps = {
  children: ReactNode;
};

export const FeedbackProvider = ({ children }: FeedbackProviderProps) => {
  const [alert, setAlert] = useState<Alert>(defaultAlert);
  const [snackbar, setSnackbar] = useState<Snackbar>(defaultAlert);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [expenses, setExpenses] = useState(null) as any[];
  const [expensesLoading, setExpensesLoading] = useState(true);

  const showAlert = useCallback(
    (message: string, severity: AlertColor | undefined) => {
      setAlert({ message, severity, open: true });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const showSnackbar = useCallback((message: string) => {
    setSnackbar({ message, open: true });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/accounts");
      if (!response.ok) {
        showAlert("Failed to load accounts", "error");
        return;
      }

      const data = await response.json();
      setAccounts(data.data);

      setAccountsLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      showAlert("Failed to load accounts", "error");
      setAccountsLoading(false); // Set loading to false even if there is an error
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/expenses?account_id=${selectedAccountId}`
      );
      if (!response.ok) {
        showAlert("Failed to load expenses", "error");
        return;
      }

      const data = await response.json();
      setExpenses(data.data);

      setExpensesLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      showAlert("Failed to load expenses", "error");
      setExpensesLoading(false); // Set loading to false even if there is an error
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchExpenses();
    }
  }, [selectedAccountId]);

  return (
    <FeedbackContext.Provider
      value={{
        alert,
        showAlert,
        closeAlert,
        snackbar,
        showSnackbar,
        closeSnackbar,
        accounts,
        accountsLoading,
        fetchAccounts,
        selectedAccountId,
        setSelectedAccountId,
        expenses,
        expensesLoading,
        fetchExpenses,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useAlert must be used within an FeedbackProvider");
  }
  return context;
};

export const useSnackbar = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useSnackbar must be used within an FeedbackProvider");
  }
  return context;
};

export const useAccounts = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useAccounts must be used within an FeedbackProvider");
  }
  return context;
};

export const useExpenses = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useExpenses must be used within an FeedbackProvider");
  }

  const { expenses, expensesLoading, setSelectedAccountId, ...rest } = context;
  return { expenses, expensesLoading, setSelectedAccountId, ...rest };
};
