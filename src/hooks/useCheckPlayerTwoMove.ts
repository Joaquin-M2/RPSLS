import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";

export function useCheckPlayerTwoMove(signer: JsonRpcSigner) {
  const [playerTwoChoice, setPlayerTwoChoice] = useState(0);
  const { gamePhase } = useGamePhaseContext();
  const { playerTwoGameAddress } = useGameAddressContext();

  useEffect(() => {
    if (gamePhase !== 3 || !playerTwoGameAddress) return;
    const checkPlayerTwoMove = async () => {
      const gameContract = new Contract(
        playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerTwoMove = await gameContract.c2();
      if (Number(playerTwoMove)) setPlayerTwoChoice(Number(playerTwoMove));
    };
    checkPlayerTwoMove();
  }, [gamePhase]);

  return [playerTwoChoice, setPlayerTwoChoice] as const;
}
