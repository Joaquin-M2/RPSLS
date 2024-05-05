import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameDataContext } from "../contexts/gameData-context";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { useGameAddressContext } from "../contexts/gameAddress-context";

export function useAmountBet(signer: JsonRpcSigner) {
  const [totalBet, setTotalBet] = useState(0);
  const { gamePhase } = useGamePhaseContext();
  const { gameStake, setGameStake } = useGameDataContext();
  const { playerOneGameAddress, playerTwoGameAddress } =
    useGameAddressContext();

  useEffect(() => {
    const calculateAmountBet = async () => {
      if (gamePhase === 1) return setTotalBet(0);
      const gameContract = new Contract(
        playerOneGameAddress || playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerTwoCommitment = await gameContract.c2();
      if (gamePhase !== 4) {
        const stake = await gameContract.stake();

        setGameStake(Number(stake));
        setTotalBet(Number(stake));
      }
      if (gamePhase === 2) return setTotalBet(gameStake);
      if (gamePhase === 3) return setTotalBet(gameStake * 2);
      // Player 1 clicked the "Timeout!" button:
      if (gamePhase === 4 && Number(playerTwoCommitment) === 0) {
        return setTotalBet(gameStake);
      } else {
        return setTotalBet(gameStake * 2);
      }
    };

    calculateAmountBet();
  }, [gamePhase]);

  return [totalBet, setTotalBet] as const;
}
