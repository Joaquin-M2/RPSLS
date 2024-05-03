import { createContext, useContext, useState } from "react";

type GamePhaseProviderProps = {
  children: React.ReactNode;
};

type GamePhaseContext = {
  playerNumber: 1 | 2;
  setPlayerNumber: React.Dispatch<React.SetStateAction<1 | 2>>;
  gamePhase: 1 | 2 | 3 | 4;
  setGamePhase: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
};

const GamePhaseContext = createContext<GamePhaseContext | null>(null);

export default function GamePhaseProvider({
  children,
}: GamePhaseProviderProps) {
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  /**
   * GAME PHASES:
   *
   * 1.- J1: Start!
   * 2.- J1: Waiting for J2
   * 2.- J2: Play!
   * 3.- J1: Solve!
   * 3.- J2: Waiting for J1
   * 4.- J1 & J2: Results
   */
  const [gamePhase, setGamePhase] = useState<1 | 2 | 3 | 4>(1);

  return (
    <GamePhaseContext.Provider
      value={{ playerNumber, setPlayerNumber, gamePhase, setGamePhase }}
    >
      {children}
    </GamePhaseContext.Provider>
  );
}

export function useGamePhaseContext() {
  const context = useContext(GamePhaseContext);

  if (!context) {
    throw new Error("useGamePhase must be used within a GamePhaseProvider.");
  }

  return context;
}
