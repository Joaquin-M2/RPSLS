import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { addressRegex } from "../utils/address-regex";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import calculateGamePhase from "../utils/calculate-game-phase";
import { useGameDataContext } from "../contexts/gameData-context";
import { useGamePhaseContext } from "../contexts/gamePhase-context";

export function useJoinAsPlayerTwo(
  signer: JsonRpcSigner,
  walletIsConnected: boolean
) {
  const [playerTwoCanJoin, setPlayerTwoCanJoin] = useState(false);
  const [joinPlayerTwoPending, setJoinPlayerTwoPending] = useState(false);
  const [joinPlayerTwoError, setJoinPlayerTwoError] = useState("");
  const { playerTwoGameAddress } = useGameAddressContext();
  const { setPlayerNumber, setGamePhase } = useGamePhaseContext();
  const { setGameStake, setLastAction } = useGameDataContext();

  useEffect(() => {
    if (!walletIsConnected) setJoinPlayerTwoError("");

    if (!signer) return;

    const checkPlayerTwoAddressIsRight = async () => {
      if (playerTwoGameAddress === "") {
        setPlayerTwoCanJoin(false);
        return setJoinPlayerTwoError("");
      }

      if (
        playerTwoGameAddress !== "" &&
        !addressRegex.test(playerTwoGameAddress)
      ) {
        setPlayerTwoCanJoin(false);
        return setJoinPlayerTwoError("Wrong smart contract address format.");
      }

      setJoinPlayerTwoPending(true);
      const gameContract = new Contract(
        playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerTwoAddressInContract = await gameContract.j2();
      const accountAddress = signer.address;
      const stake = await gameContract.stake();
      setGameStake(Number(stake));
      const lastAction = await gameContract.lastAction();
      setLastAction(Number(lastAction));
      if (playerTwoAddressInContract !== accountAddress) {
        setPlayerTwoCanJoin(false);
        setJoinPlayerTwoError(
          "This game didn't set your account address as Player 2."
        );
      } else {
        setJoinPlayerTwoError("");
        setPlayerTwoCanJoin(true);
        setPlayerNumber(2);
        setGamePhase(await calculateGamePhase(playerTwoGameAddress, signer));
      }
      setJoinPlayerTwoPending(false);
    };

    checkPlayerTwoAddressIsRight();
  }, [signer, playerTwoGameAddress, walletIsConnected]);

  return [playerTwoCanJoin, joinPlayerTwoPending, joinPlayerTwoError];
}
