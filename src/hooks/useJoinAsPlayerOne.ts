import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { addressRegex } from "../utils/address-regex";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import calculateGamePhase from "../utils/calculate-game-phase";
import { useGameDataContext } from "../contexts/gameData-context";
import { useGamePhaseContext } from "../contexts/gamePhase-context";

export function useJoinAsPlayerOne(
  signer: JsonRpcSigner,
  walletIsConnected: boolean
) {
  const [playerOneCanJoin, setPlayerOneCanJoin] = useState(false);
  const [joinPlayerOnePending, setJoinPlayerOnePending] = useState(false);
  const [joinPlayerOneError, setJoinPlayerOneError] = useState("");
  const { playerOneGameAddress } = useGameAddressContext();
  const { setPlayerNumber, setGamePhase } = useGamePhaseContext();
  const { setGameStake, setLastAction } = useGameDataContext();

  useEffect(() => {
    if (!walletIsConnected) setJoinPlayerOneError("");

    if (!signer) return;

    const checkPlayerOneAddressIsRight = async () => {
      if (playerOneGameAddress === "") {
        setPlayerOneCanJoin(false);
        return setJoinPlayerOneError("");
      }

      if (
        playerOneGameAddress !== "" &&
        !addressRegex.test(playerOneGameAddress)
      ) {
        setPlayerOneCanJoin(false);
        return setJoinPlayerOneError("Wrong smart contract address format.");
      }

      setJoinPlayerOnePending(true);
      const gameContract = new Contract(
        playerOneGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerOneAddressInContract = await gameContract.j1();
      const accountAddress = signer.address;
      const stake = await gameContract.stake();
      setGameStake(Number(stake));
      const lastAction = await gameContract.lastAction();
      setLastAction(Number(lastAction));
      if (playerOneAddressInContract !== accountAddress) {
        setPlayerOneCanJoin(false);
        setJoinPlayerOneError(
          "This game didn't set your account address as Player 1."
        );
      } else {
        setJoinPlayerOneError("");
        setPlayerOneCanJoin(true);
        setPlayerNumber(1);
        setGamePhase(await calculateGamePhase(playerOneGameAddress, signer));
      }
      setJoinPlayerOnePending(false);
    };

    checkPlayerOneAddressIsRight();
  }, [signer, playerOneGameAddress]);

  return [playerOneCanJoin, joinPlayerOnePending, joinPlayerOneError];
}
