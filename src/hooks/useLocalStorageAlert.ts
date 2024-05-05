import { useEffect, useState } from "react";
import { useGamePhaseContext } from "../contexts/gamePhase-context";

export const LOCAL_STORAGE_WARNING =
  'Make sure your browser localStorage is not altered. Otherwise this game will only be finished by Player 2 by clicking on the "TIMEOUT" button.';
export const LOCAL_STORAGE_ERROR =
  'It seems your browser localStorage was altered. The game will have to be finished by Player 2 by clicking on the "TIMEOUT" button.';

export function useLocalStorageAlert() {
  const [playerOneAlert, setPlayerOneAlert] = useState(LOCAL_STORAGE_WARNING);
  const { gamePhase, playerNumber } = useGamePhaseContext();

  useEffect(() => {
    if (playerNumber !== 1) return;
    if (gamePhase > 1 && JSON.parse(localStorage.getItem("startedGames")!)) {
      setPlayerOneAlert(LOCAL_STORAGE_WARNING);
    } else {
      setPlayerOneAlert(LOCAL_STORAGE_ERROR);
    }
  }, [gamePhase]);

  return [playerOneAlert, setPlayerOneAlert] as const;
}
