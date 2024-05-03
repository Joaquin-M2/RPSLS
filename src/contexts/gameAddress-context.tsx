import { createContext, useContext, useState } from "react";

type GameAddressProviderProps = {
  children: React.ReactNode;
};

type GameAddressContext = {
  playerOneGameAddress: string;
  setPlayerOneGameAddress: React.Dispatch<React.SetStateAction<string>>;
  playerTwoGameAddress: string;
  setPlayerTwoGameAddress: React.Dispatch<React.SetStateAction<string>>;
};

const GameAddressContext = createContext<GameAddressContext | null>(null);

export default function GameAddressProvider({
  children,
}: GameAddressProviderProps) {
  const [playerOneGameAddress, setPlayerOneGameAddress] = useState("");
  const [playerTwoGameAddress, setPlayerTwoGameAddress] = useState("");

  return (
    <GameAddressContext.Provider
      value={{
        playerOneGameAddress,
        setPlayerOneGameAddress,
        playerTwoGameAddress,
        setPlayerTwoGameAddress,
      }}
    >
      {children}
    </GameAddressContext.Provider>
  );
}

export function useGameAddressContext() {
  const context = useContext(GameAddressContext);

  if (!context) {
    throw new Error(
      "useGameAddress must be used within a GameAddressProvider."
    );
  }

  return context;
}
