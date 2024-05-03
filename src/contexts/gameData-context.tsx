import { createContext, useContext, useState } from "react";

type GameDataProviderProps = {
  children: React.ReactNode;
};

type GameDataContext = {
  gameStake: number;
  setGameStake: React.Dispatch<React.SetStateAction<number>>;
  lastAction: number;
  setLastAction: React.Dispatch<React.SetStateAction<number>>;
};

const GameDataContext = createContext<GameDataContext | null>(null);

export default function GameDataProvider({ children }: GameDataProviderProps) {
  const [gameStake, setGameStake] = useState(0);
  const [lastAction, setLastAction] = useState(0);

  return (
    <GameDataContext.Provider
      value={{
        gameStake,
        setGameStake,
        lastAction,
        setLastAction,
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameDataContext() {
  const context = useContext(GameDataContext);

  if (!context) {
    throw new Error("useGameData must be used within a GameDataProvider.");
  }

  return context;
}
