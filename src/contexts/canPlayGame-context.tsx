import { createContext, useContext, useState } from "react";

type CanPlayGameProviderProps = {
  children: React.ReactNode;
};

type CanPlayGameContext = {
  canPlayGame: boolean;
  setCanPlayGame: React.Dispatch<React.SetStateAction<boolean>>;
};

const CanPlayGameContext = createContext<CanPlayGameContext | null>(null);

export default function CanPlayGameProvider({
  children,
}: CanPlayGameProviderProps) {
  const [canPlayGame, setCanPlayGame] = useState(false);

  return (
    <CanPlayGameContext.Provider value={{ canPlayGame, setCanPlayGame }}>
      {children}
    </CanPlayGameContext.Provider>
  );
}

export function useCanPlayGameContext() {
  const context = useContext(CanPlayGameContext);

  if (!context) {
    throw new Error(
      "useCanPlayGame must be used within a CanPlayGameProvider."
    );
  }

  return context;
}
