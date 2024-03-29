"use client";

import React, {
  createContext,
  useState,
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

  return (
    <FeedbackContext.Provider
      value={{
        alert,
        showAlert,
        closeAlert,
        snackbar,
        showSnackbar,
        closeSnackbar,
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
