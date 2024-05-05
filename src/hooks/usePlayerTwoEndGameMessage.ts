import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { useGameDataContext } from "../contexts/gameData-context";

export function usePlayerTwoEndGameMessage(signer: JsonRpcSigner) {
  const [playerTwoEndGameMessage, setPlayerTwoEndGameMessage] = useState("");
  const [afterBetPlayerTwoBalance, setAfterBetPlayerTwoBalance] = useState<
    bigint | null
  >(null);
  const { gamePhase, playerNumber } = useGamePhaseContext();
  const { playerOneGameAddress, playerTwoGameAddress } =
    useGameAddressContext();
  const { gameStake } = useGameDataContext();

  useEffect(() => {
    if (gamePhase === 1) {
      setAfterBetPlayerTwoBalance(null);
      return;
    }

    const createPlayerTwoEndGameMessage = async () => {
      const gameContract = new Contract(
        playerOneGameAddress || playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerTwoCommitment = await gameContract.c2();
      const gameStakeToBigInt = BigInt(gameStake);
      if (gamePhase >= 3) {
        const playerBalance = await signer.provider.getBalance(signer.address);
        setAfterBetPlayerTwoBalance(playerBalance);
      }
      if (gamePhase === 4 && playerTwoCommitment) {
        const totalBet = gameStakeToBigInt * 2n;

        const solvedGamePlayerBalance = await signer.provider.getBalance(
          signer.address
        );
        if (afterBetPlayerTwoBalance! + totalBet! === solvedGamePlayerBalance) {
          setPlayerTwoEndGameMessage("You win!");
        } else if (
          afterBetPlayerTwoBalance! + totalBet! / 2n ===
          solvedGamePlayerBalance
        ) {
          setPlayerTwoEndGameMessage("It's a tie!");
        } else if (solvedGamePlayerBalance === afterBetPlayerTwoBalance!) {
          setPlayerTwoEndGameMessage("You lose!");
        }
      }
      if (gamePhase === 4 && !playerTwoCommitment) {
        setPlayerTwoEndGameMessage("Timeout! Player 1 cancelled the game.");
      }
      if (gamePhase === 4 && playerTwoCommitment && !gameStakeToBigInt) {
        setPlayerTwoEndGameMessage("Game finished!");
      }
    };

    if (playerNumber === 2) createPlayerTwoEndGameMessage();
  }, [gamePhase]);

  return [playerTwoEndGameMessage, setPlayerTwoEndGameMessage] as const;
}
