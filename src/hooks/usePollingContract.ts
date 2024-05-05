import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { useGameDataContext } from "../contexts/gameData-context";

export function usePollingContract(signer: JsonRpcSigner) {
  const { gamePhase, setGamePhase } = useGamePhaseContext();
  const { playerOneGameAddress, playerTwoGameAddress } =
    useGameAddressContext();
  const { lastAction, setLastAction } = useGameDataContext();
  const [timesPolled, setTimesPolled] = useState(0);

  useEffect(() => {
    const pollContract = async () => {
      if (gamePhase === 4) return;
      const gameContract = new Contract(
        playerOneGameAddress || playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );

      if (gamePhase > 1 && gamePhase < 4) {
        if (!lastAction) {
          const lastAction = await gameContract.lastAction();
          setLastAction(Number(lastAction));
        }

        const playerTwoMove = await gameContract.c2();
        if (Number(playerTwoMove) && gamePhase !== 3) setGamePhase(3);

        const stake = await gameContract.stake();
        if (Number(stake) === 0) setGamePhase(4);
      }
    };

    let pollingTimer: NodeJS.Timeout;

    if (gamePhase > 1 && gamePhase < 4) {
      pollingTimer = setTimeout(() => {
        const polling = async () => await pollContract();
        polling();
        setTimesPolled((prevValue) => prevValue + 1);
      }, 2000);
    }

    return () => {
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [timesPolled, gamePhase]);
}
