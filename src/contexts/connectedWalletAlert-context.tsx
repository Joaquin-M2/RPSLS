import { createContext, useContext, useState } from "react";

type ConnectedWalletAlertProviderProps = {
  children: React.ReactNode;
};

type ConnectedWalletAlertContext = {
  showConnectedWalletAlert: boolean;
  setShowConnectedWalletAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConnectedWalletAlertContext =
  createContext<ConnectedWalletAlertContext | null>(null);

export default function ConnectedWalletAlertProvider({
  children,
}: ConnectedWalletAlertProviderProps) {
  const [showConnectedWalletAlert, setShowConnectedWalletAlert] =
    useState(false);

  return (
    <ConnectedWalletAlertContext.Provider
      value={{ showConnectedWalletAlert, setShowConnectedWalletAlert }}
    >
      {children}
    </ConnectedWalletAlertContext.Provider>
  );
}

export function useConnectedWalletAlertContext() {
  const context = useContext(ConnectedWalletAlertContext);

  if (!context) {
    throw new Error(
      "useConnectedWalletAlert must be used within a ConnectedWalletAlertProvider."
    );
  }

  return context;
}
