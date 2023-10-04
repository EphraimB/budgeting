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

type AlertContextProps = {
  alert: Alert;
  showAlert: (message: string, severity: AlertColor | undefined) => void;
  closeAlert: () => void;
};

const defaultAlert: Alert = {
  message: "",
  severity: undefined,
  open: false,
};

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

type AlertProviderProps = {
  children: ReactNode;
};

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alert, setAlert] = useState<Alert>(defaultAlert);

  const showAlert = useCallback(
    (message: string, severity: AlertColor | undefined) => {
      setAlert({ message, severity, open: true });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, closeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
