import { useEffect, useState } from "react";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { PlayerOneGameData } from "../types/PlayerOneGameData";
import { GAME_CHOICES } from "../constants/gameStructure";

export function usePlayerOneSelection() {
  const [playerOneChoiceName, setPlayerOneChoiceName] = useState<string | null>(
    ""
  );
  const { gamePhase, playerNumber } = useGamePhaseContext();
  const { playerOneGameAddress } = useGameAddressContext();

  useEffect(() => {
    if (
      playerNumber !== 1 ||
      !JSON.parse(localStorage.getItem("startedGames")!)
    )
      return;

    if (gamePhase === 2 || gamePhase === 3) {
      const getPlayerOneSelection = () => {
        const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
        const currentGame = startedGames.find(
          (game: PlayerOneGameData) =>
            game.gameAddress.toLowerCase() ===
            playerOneGameAddress.toLowerCase()
        );
        if (currentGame) {
          const playerOneSelection = currentGame.c1Move;
          return GAME_CHOICES[playerOneSelection];
        } else {
          return "";
        }
      };

      setPlayerOneChoiceName(getPlayerOneSelection());
    }
  }, [gamePhase]);

  return [playerOneChoiceName];
}
