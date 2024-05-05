import { useEffect, useState } from "react";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameDataContext } from "../contexts/gameData-context";

export function useTimeout() {
  const [counter, setCounter] = useState(0);
  const { lastAction } = useGameDataContext();
  const { gamePhase } = useGamePhaseContext();

  useEffect(() => {
    if (lastAction! + 300 - Date.parse(String(new Date())) / 1000 > 0) {
      setCounter(lastAction! + 300 - Date.parse(String(new Date())) / 1000);
    } else {
      setCounter(0);
    }
    let timer: NodeJS.Timeout;
    if (gamePhase === 1 || counter <= 0) return;

    if (counter > 0) {
      timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [counter, lastAction, gamePhase]);

  return [counter];
}
