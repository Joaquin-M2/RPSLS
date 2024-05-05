import { useEffect, useRef } from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { useConnectedWalletAlertContext } from "../contexts/connectedWalletAlert-context";

import styles from "./CreateGamePage.module.scss";
import { useCanPlayGameContext } from "../contexts/canPlayGame-context";
import { JsonRpcSigner } from "ethers";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { useJoinAsPlayerOne } from "../hooks/useJoinAsPlayerOne";
import { useJoinAsPlayerTwo } from "../hooks/useJoinAsPlayerTwo";
import JoinGameCard from "./JoinGameCard";

type CreateGamePageProps = {
  walletIsConnected: boolean;
  signer: JsonRpcSigner;
};

export default function CreateGamePage({
  walletIsConnected,
  signer,
}: CreateGamePageProps) {
  const playerOneInputGameAddress = useRef<HTMLInputElement | null>(null);
  const playerTwoInputGameAddress = useRef<HTMLInputElement | null>(null);

  const { setPlayerNumber, setGamePhase } = useGamePhaseContext();
  const { setCanPlayGame } = useCanPlayGameContext();
  const { setPlayerOneGameAddress, setPlayerTwoGameAddress } =
    useGameAddressContext();
  const { showConnectedWalletAlert, setShowConnectedWalletAlert } =
    useConnectedWalletAlertContext();
  const [playerOneCanJoin, joinPlayerOnePending, joinPlayerOneError] =
    useJoinAsPlayerOne(signer, walletIsConnected);
  const [playerTwoCanJoin, joinPlayerTwoPending, joinPlayerTwoError] =
    useJoinAsPlayerTwo(signer, walletIsConnected);

  //////////////////////////////////////
  // RESET JOIN GAME FIELDS

  useEffect(() => {
    if (!walletIsConnected && playerOneInputGameAddress.current !== null) {
      playerOneInputGameAddress.current.value = "";
    }

    if (!walletIsConnected && playerTwoInputGameAddress.current !== null) {
      playerTwoInputGameAddress.current.value = "";
    }
  }, [walletIsConnected]);

  //////////////////////////////////////
  // CHECK WALLET IS CONNECTED

  const checkWalletIsConnected = async () => {
    if (walletIsConnected) {
      //await checkGamePhase();
      setCanPlayGame(true);
    } else {
      setShowConnectedWalletAlert(true);
    }
  };

  return (
    <>
      <div className={styles.centerWrapper}>
        <Button
          variant="contained"
          sx={{ marginBottom: "15rem", padding: "2rem 4rem", fontSize: "2rem" }}
          onClick={() => {
            checkWalletIsConnected();
            setPlayerNumber(1);
            setGamePhase(1);
          }}
        >
          Create New Game!
        </Button>
        <JoinGameCard
          walletIsConnected={walletIsConnected}
          joinPlayerError={joinPlayerOneError}
          playerCanJoin={playerOneCanJoin}
          joinPlayerIsPending={joinPlayerOnePending}
          ref={playerOneInputGameAddress}
          onChangeInput={(e) =>
            setPlayerOneGameAddress((e.target as HTMLInputElement).value)
          }
          onClickButton={checkWalletIsConnected}
        >
          <p className={styles.joinGameParagraph}>
            Did you create a game and it is not finished yet? <br />
            Just connect your wallet and put the game address here! <br />
            (Check your wallet transactions if you lost the game address.)
          </p>
        </JoinGameCard>
        <JoinGameCard
          walletIsConnected={walletIsConnected}
          joinPlayerError={joinPlayerTwoError}
          playerCanJoin={playerTwoCanJoin}
          joinPlayerIsPending={joinPlayerTwoPending}
          ref={playerTwoInputGameAddress}
          onChangeInput={(e) =>
            setPlayerTwoGameAddress((e.target as HTMLInputElement).value)
          }
          onClickButton={checkWalletIsConnected}
        >
          <p className={styles.joinGameParagraph}>
            Were you challenged by another player? <br />
            He should have sent you the game address. <br />
            Connect your wallet and put the game address here!
          </p>
        </JoinGameCard>
      </div>
      <Collapse in={showConnectedWalletAlert}>
        <Alert variant="filled" severity="warning">
          Connect your wallet first!
        </Alert>
      </Collapse>
    </>
  );
}
