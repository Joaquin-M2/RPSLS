import { useEffect, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import { useConnectedWalletAlertContext } from "../contexts/connectedWalletAlert-context";

import styles from "./CreateGamePage.module.scss";
import { useCanPlayGameContext } from "../contexts/canPlayGame-context";
import { addressRegex } from "../utils/address-regex";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { Contract, JsonRpcSigner } from "ethers";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import calculateGamePhase from "../utils/calculate-game-phase";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { useGameDataContext } from "../contexts/gameData-context";
import { Box, CircularProgress } from "@mui/material";

type CreateGamePageProps = {
  walletIsConnected: boolean;
  signer: JsonRpcSigner;
};

export default function CreateGamePage({
  walletIsConnected,
  signer,
}: CreateGamePageProps) {
  const {
    playerOneGameAddress,
    setPlayerOneGameAddress,
    playerTwoGameAddress,
    setPlayerTwoGameAddress,
  } = useGameAddressContext();
  const { showConnectedWalletAlert, setShowConnectedWalletAlert } =
    useConnectedWalletAlertContext();
  const { setCanPlayGame } = useCanPlayGameContext();
  const [playerOneCanJoin, setPlayerOneCanJoin] = useState(false);
  const [joinPlayerOnePending, setJoinPlayerOnePending] = useState(false);
  const [joinPlayerOneError, setJoinPlayerOneError] = useState("");
  const [playerTwoCanJoin, setPlayerTwoCanJoin] = useState(false);
  const [joinPlayerTwoPending, setJoinPlayerTwoPending] = useState(false);
  const [joinPlayerTwoError, setJoinPlayerTwoError] = useState("");
  const playerOneInputGameAddress = useRef<HTMLInputElement | null>(null);
  const playerTwoInputGameAddress = useRef<HTMLInputElement | null>(null);

  const { setPlayerNumber, setGamePhase } = useGamePhaseContext();

  const { setGameStake, setLastAction } = useGameDataContext();

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
  // JOIN GAME AS PLAYER 1

  useEffect(() => {
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
  }, [playerOneGameAddress, signer]);

  useEffect(() => {
    if (!setPlayerOneGameAddress) setPlayerOneCanJoin(false);
    if (!setPlayerTwoGameAddress) setPlayerTwoCanJoin(false);
  }, []);

  //////////////////////////////////////
  // JOIN GAME AS PLAYER 2

  useEffect(() => {
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
  }, [playerTwoGameAddress, signer]);

  //////////////////////////////////////
  // REMOVE ERRORS IF WALLET IS NOT CONNECTED

  useEffect(() => {
    if (!walletIsConnected) {
      setJoinPlayerOneError("");
      setJoinPlayerTwoError("");
    }
  }, [walletIsConnected]);

  //////////////////////////////////////
  // CHECK WALLET IS CONNECTED

  const checkWalletIsConnected = () => {
    if (walletIsConnected) {
      setCanPlayGame(true);
    } else {
      setShowConnectedWalletAlert(true);
    }
  };

  //////////////////////////////////////
  // LOADING COMPONENT

  const loadingCircle = (
    <Box sx={{}}>
      <CircularProgress />
    </Box>
  );

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
        <div className={styles.joinGameWrapper}>
          <p className={styles.joinGameParagraph}>
            Did you create a game and it is not finished yet? <br />
            Just connect your wallet and put the game address here! <br />
            (Check your wallet transactions if you lost the game address.)
          </p>
          <div className={styles.joinGameAddressWrapper}>
            <TextField
              disabled={!walletIsConnected}
              error={!!joinPlayerOneError}
              helperText={joinPlayerOneError}
              id="outlined-basic"
              label="Game (Smart Contract) Address"
              onChange={(e) => setPlayerOneGameAddress(e.target.value)}
              inputRef={playerOneInputGameAddress}
              sx={{
                marginBottom: "5rem",
                width: "42rem",
                input: {
                  "&:disabled": {
                    cursor: "not-allowed",
                    pointerEvents: "all !important",
                  },
                },
              }}
              variant="outlined"
            />
            <Button
              disabled={!playerOneCanJoin || !walletIsConnected}
              variant="contained"
              sx={{
                position: "absolute",
                bottom: 0,
                "&:disabled": {
                  cursor: "not-allowed",
                  pointerEvents: "all !important",
                },
              }}
              onClick={() => {
                checkWalletIsConnected();
              }}
            >
              {joinPlayerOnePending ? loadingCircle : "Join the game!"}
            </Button>
          </div>
        </div>
        <div className={styles.joinGameWrapper}>
          <p className={styles.joinGameParagraph}>
            Were you challenged by another player? <br />
            He should have sent you the game address. <br />
            Connect your wallet and put the game address here!
          </p>
          <div className={styles.joinGameAddressWrapper}>
            <TextField
              disabled={!walletIsConnected}
              error={!!joinPlayerTwoError}
              helperText={joinPlayerTwoError}
              id="outlined-basic"
              label="Game (Smart Contract) Address"
              onChange={(e) => setPlayerTwoGameAddress(e.target.value)}
              inputRef={playerTwoInputGameAddress}
              sx={{
                marginBottom: "5rem",
                width: "42rem",
                input: {
                  "&:disabled": {
                    cursor: "not-allowed",
                    pointerEvents: "all !important",
                  },
                },
              }}
              variant="outlined"
            />
            <Button
              disabled={!playerTwoCanJoin || !walletIsConnected}
              variant="contained"
              sx={{
                position: "absolute",
                bottom: 0,
                "&:disabled": {
                  cursor: "not-allowed",
                  pointerEvents: "all !important",
                },
              }}
              onClick={() => {
                checkWalletIsConnected();
              }}
            >
              {joinPlayerTwoPending ? loadingCircle : "Join the game!"}
            </Button>
          </div>
        </div>
      </div>
      <Collapse in={showConnectedWalletAlert}>
        <Alert variant="filled" severity="warning">
          Connect your wallet first!
        </Alert>
      </Collapse>
    </>
  );
}
