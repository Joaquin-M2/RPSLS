import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import rulesImage from "../assets/rpsls-rules.jpg";

import styles from "./PlayGamePage.module.scss";
import { useEffect, useState } from "react";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { RPSLS_BYTECODE } from "../contracts/rpsls-bytecode";
import { Contract, JsonRpcSigner, ethers } from "ethers";
import { addressRegex } from "../utils/address-regex";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { useGameDataContext } from "../contexts/gameData-context";
import { useCanPlayGameContext } from "../contexts/canPlayGame-context";
import { usePollingContract } from "../hooks/usePollingContract";
import { useSalt } from "../hooks/useSalt";
import { useHasherContract } from "../hooks/useHasherContract";
import {
  LOCAL_STORAGE_ERROR,
  useLocalStorageAlert,
} from "../hooks/useLocalStorageAlert";
import { useCheckPlayerTwoMove } from "../hooks/useCheckPlayerTwoMove";
import { usePlayerTwoEndGameMessage } from "../hooks/usePlayerTwoEndGameMessage";
import { useTimeout } from "../hooks/useTimeout";
import { useAmountBet } from "../hooks/useAmountBet";
import preventPasteNegativeNumber from "../utils/prevent-paste-negative-number";
import preventMinus from "../utils/prevent-minus";
import { PlayerOneGameData } from "../types/PlayerOneGameData";
import { GAME_CHOICES } from "../constants/gameStructure";
import { usePlayerOneSelection } from "../hooks/usePlayerOneSelection";
import Scoreboard from "./Scoreboard";
import PlayerColumnCard from "./PlayerColumnCard";
import ChoiceSelector from "./ChoiceSelector";
import PlayerChoiceVisibility from "./PlayerChoiceVisibility";
import TimeoutButton from "./TimeoutButton";
import PlayGameCentralButtons from "./PlayGameCentralButtons";
import PlayGameAuxiliarSection from "./PlayGameAuxiliarSection";

type PlayGamePageProps = {
  signer: JsonRpcSigner;
};

export default function PlayGamePage({ signer }: PlayGamePageProps) {
  const [playerOneChoice, setPlayerOneChoice] = useState(0);
  const [playerOneBet, setPlayOneBet] = useState(0);
  const [playerTwoAddress, setPlayerTwoAddress] = useState("");
  const [rulesDialogIsOpen, setRulesDialogIsOpen] = useState(false);
  const [playerChoiceIsVisible, setPlayerChoiceIsVisible] = useState(false);
  const [startGameButtonIsPending, setStartGameButtonIsPending] =
    useState(false);
  const [playButtonIsPending, setPlayButtonIsPending] = useState(false);
  const [solveButtonIsPending, setSolveButtonIsPending] = useState(false);
  const [timeoutIsPending, setTimeoutIsPending] = useState(false);
  const [fieldIsDisabled, setFieldIsDisabled] = useState(false);
  const [playerOneEndGameMessage, setPlayerOneEndGameMessage] =
    useState("Timeout! You lose!");
  const { gamePhase, setGamePhase, playerNumber } = useGamePhaseContext();
  const {
    playerOneGameAddress,
    playerTwoGameAddress,
    setPlayerOneGameAddress,
    setPlayerTwoGameAddress,
  } = useGameAddressContext();
  const { gameStake, setGameStake, setLastAction } = useGameDataContext();
  const { setCanPlayGame } = useCanPlayGameContext();

  //////////////////////////////////////
  // POLLING

  usePollingContract(signer);

  //////////////////////////////////////
  // SALT

  const [salt] = useSalt();

  //////////////////////////////////////
  // START GAME

  const [hasherContract] = useHasherContract(signer);

  const interactWithHasher = async () => {
    const c1Hash = await hasherContract?.hash(playerOneChoice, salt);

    return c1Hash;
  };

  const deployRPSLSContract = async (_c1Hash: string) => {
    const ContractFactory = new ethers.ContractFactory(
      RPSLS_ABI,
      RPSLS_BYTECODE,
      signer
    );
    const deployedContract = await ContractFactory.deploy(
      _c1Hash,
      playerTwoAddress,
      { value: playerOneBet }
    );
    await deployedContract.waitForDeployment();

    return deployedContract;
  };

  const startGame = async () => {
    try {
      setStartGameButtonIsPending(true);
      setFieldIsDisabled(true);
      const c1HashCommitment = await interactWithHasher();
      const gameContractDeployment = await deployRPSLSContract(
        c1HashCommitment
      );
      await gameContractDeployment.waitForDeployment();
      const gameContractAddress = gameContractDeployment.target;
      const gameContractAddressToString = String(gameContractAddress);
      setPlayerOneGameAddress(gameContractAddressToString);

      const gameContract = new Contract(
        gameContractAddressToString,
        RPSLS_ABI,
        signer
      );
      const playerOneLastAction = await gameContract.lastAction();
      setLastAction(Number(playerOneLastAction));

      const stake = await gameContract.stake();
      setGameStake(Number(stake));
      setTotalBet(Number(stake));

      if (localStorage.getItem("startedGames")) {
        const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
        const newStartedGames = [
          ...startedGames,
          {
            c1Move: playerOneChoice,
            gameAddress: gameContractAddressToString,
            playerOneAddress: signer.address,
            salt: salt,
            solvedWithoutTimeout: true,
          },
        ];
        localStorage.setItem("startedGames", JSON.stringify(newStartedGames));
      } else {
        localStorage.setItem(
          "startedGames",
          JSON.stringify([
            {
              c1Move: playerOneChoice,
              gameAddress: gameContractAddressToString,
              playerOneAddress: signer.address,
              salt: salt,
              solvedWithoutTimeout: true,
            },
          ])
        );
      }
      setGamePhase(2);
    } catch (error) {
      setStartGameButtonIsPending(false);
      setFieldIsDisabled(false);
    }
  };

  const [playerOneAlert, setPlayerOneAlert] = useLocalStorageAlert();

  //////////////////////////////////////
  // PLAY GAME

  const playGame = async () => {
    try {
      setPlayButtonIsPending(true);
      setFieldIsDisabled(true);
      const gameContract = new Contract(
        playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      await gameContract.play(playerTwoChoice, { value: gameStake });

      const playerTwoLastAction = await gameContract.lastAction();
      setLastAction(Number(playerTwoLastAction));

      setGamePhase(3);
    } catch (error) {
      setPlayButtonIsPending(false);
      setFieldIsDisabled(false);
    }
  };

  const [playerTwoChoice, setPlayerTwoChoice] = useCheckPlayerTwoMove(signer);

  //////////////////////////////////////
  // SOLVE GAME

  type updateStartedGamesParams = {
    startedGames: PlayerOneGameData[];
    currentGame: PlayerOneGameData;
    currentGameIndex: number;
  };

  const updateStartedGames = ({
    startedGames,
    currentGame,
    currentGameIndex,
  }: updateStartedGamesParams) => {
    const updatedCurrentGame = {
      ...currentGame,
      solvedWithoutTimeout: false,
    };
    startedGames.splice(currentGameIndex, 1);
    const updatedStartedGames = [...startedGames, updatedCurrentGame];
    localStorage.setItem("startedGames", JSON.stringify(updatedStartedGames));
  };

  type createPlayerOneEndGameMessageParams = {
    currentGame: PlayerOneGameData;
    gameContract: Contract;
  };

  const createPlayerOneEndGameMessage = async ({
    currentGame,
    gameContract,
  }: createPlayerOneEndGameMessageParams) => {
    const playerOneMove = currentGame.c1Move;
    const playerTwoMove = await gameContract.c2();
    const checkWinner = await gameContract.win(playerOneMove, playerTwoMove);
    if (playerOneMove === Number(playerTwoMove)) {
      setPlayerOneEndGameMessage("It's a tie!");
    } else if (checkWinner === true) {
      setPlayerOneEndGameMessage("You win!");
    } else if (checkWinner === false) {
      setPlayerOneEndGameMessage("You lose!");
    }
  };

  const solveGame = async () => {
    try {
      const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
      if (!startedGames) {
        setPlayerOneAlert(LOCAL_STORAGE_ERROR);
        return;
      }
      const currentGameIndex = startedGames.findIndex(
        (game: PlayerOneGameData) => game.gameAddress === playerOneGameAddress
      );
      const currentGame = startedGames[currentGameIndex];
      const gameContract = new Contract(
        playerOneGameAddress,
        RPSLS_ABI,
        signer
      );
      setSolveButtonIsPending(true);
      await gameContract.solve(currentGame.c1Move, currentGame.salt);

      updateStartedGames({ startedGames, currentGame, currentGameIndex });

      await createPlayerOneEndGameMessage({ currentGame, gameContract }).then(
        () => setGamePhase(4)
      );
      /**
       * User's browser localStorage should be deleted to not bloat it with data from finished games.
       * Nevertheless, if we don't want to use a centralized database we have to rely on localStorage to make the app a bit more robust.
       *
       * startedGames.splice(currentGameIndex, 1);
       */
    } catch (error) {
      setSolveButtonIsPending(false);
    }
  };

  //////////////////////////////////////
  // PENDING & DISABLED BUTTONS

  useEffect(() => {
    if (gamePhase === 1) {
      setStartGameButtonIsPending(false);
      setPlayButtonIsPending(false);
      setSolveButtonIsPending(false);
      setTimeoutIsPending(false);

      setFieldIsDisabled(false);
    }
  }, [gamePhase]);

  //////////////////////////////////////
  // SET WINNER

  useEffect(() => {
    if (playerNumber === 1 && gamePhase === 4 && !gameStake) {
      setPlayerOneEndGameMessage("Game finished!");
    }
  }, [gamePhase]);

  const [playerTwoEndGameMessage, setPlayerTwoEndGameMessage] =
    usePlayerTwoEndGameMessage(signer);

  //////////////////////////////////////
  // TIMEOUT

  const [counter] = useTimeout();

  const playerOneClicksTimeout = async () => {
    try {
      setTimeoutIsPending(true);
      const gameContract = new Contract(
        playerOneGameAddress,
        RPSLS_ABI,
        signer
      );
      setPlayerOneEndGameMessage("Timeout! The game was cancelled.");
      await gameContract.j2Timeout();
      setGamePhase(4);
    } catch (error) {
      setTimeoutIsPending(false);
    }
  };

  const playerTwoClicksTimeout = async () => {
    try {
      setTimeoutIsPending(true);
      const gameContract = new Contract(
        playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      await gameContract.j1Timeout();
      setGamePhase(4);
      setPlayerTwoEndGameMessage("Timeout! You win!");
    } catch (error) {
      setTimeoutIsPending(false);
    }
  };

  //////////////////////////////////////
  // AMOUNT BET

  const [totalBet, setTotalBet] = useAmountBet(signer);

  //////////////////////////////////////
  // GET PLAYER 1 SELECTION

  const [playerOneChoiceName] = usePlayerOneSelection();

  return (
    <>
      {playerNumber === 1 && gamePhase > 1 && gamePhase < 4 && (
        <Alert
          variant="filled"
          severity={
            playerOneAlert.startsWith("Make sure") ? "warning" : "error"
          }
        >
          {playerOneAlert}
        </Alert>
      )}
      <Scoreboard totalBet={totalBet} />

      <div className={styles.playersWrapper}>
        <PlayerColumnCard
          title={`Player 1${playerNumber === 1 ? " (You)" : ""}`}
        >
          <>
            {playerNumber === 1 && gamePhase === 1 && (
              <>
                <div className={styles.placeBetWrapper}>
                  <TextField
                    id="filled-number"
                    label="Your bet (Wei)"
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{ width: "100%" }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={fieldIsDisabled}
                    onPaste={preventPasteNegativeNumber}
                    onKeyDown={preventMinus}
                    onChange={(e) => setPlayOneBet(+e.target.value)}
                  />
                  <a href="https://eth-converter.com/" target="_blank">
                    ETH - Gwei - Wei converter
                  </a>
                </div>
                <ChoiceSelector
                  id="select-option-p1"
                  playerChoice={playerOneChoice}
                  fieldIsDisabled={fieldIsDisabled}
                  onChangeSelect={(event) =>
                    setPlayerOneChoice(event.target.value as number)
                  }
                />
              </>
            )}
            {playerNumber === 1 && (gamePhase === 2 || gamePhase === 3) && (
              <PlayerChoiceVisibility
                playerChoiceIsVisible={playerChoiceIsVisible}
                playerChoiceName={playerOneChoiceName}
                onClickVisibilityOff={() => setPlayerChoiceIsVisible(false)}
                onClickVisibilityOn={() => setPlayerChoiceIsVisible(true)}
              />
            )}
            {playerNumber === 1 && gamePhase === 2 && (
              <TimeoutButton
                counter={counter}
                timeoutIsPending={timeoutIsPending}
                onClickButton={() => playerOneClicksTimeout()}
              >
                Player 1 took too long to solve.
                <br />
                You can end (and win!) the game now.
              </TimeoutButton>
            )}
            {playerNumber === 2 && gamePhase === 2 && (
              <p className={styles.playerParagraph}>Waiting your move.</p>
            )}
            {playerNumber === 2 && gamePhase === 3 && (
              <p className={styles.playerParagraph}>Solving...</p>
            )}
          </>
        </PlayerColumnCard>
        <div className={styles.centerWrapper}>
          <PlayGameCentralButtons
            gamePhase={gamePhase}
            onClickPlayGameButton={playGame}
            onClickSolveGameButton={solveGame}
            playButtonIsPending={playButtonIsPending}
            onClickStartGameButton={startGame}
            playerNumber={playerNumber}
            playerOneBet={playerOneBet}
            playerOneChoice={playerOneChoice}
            playerOneEndGameMessage={playerOneEndGameMessage}
            playerTwoAddress={playerTwoAddress}
            playerTwoEndGameMessage={playerTwoEndGameMessage}
            solveButtonIsDisabled={playerOneAlert === LOCAL_STORAGE_ERROR}
            solveButtonIsPending={solveButtonIsPending}
            startGameButtonIsPending={startGameButtonIsPending}
          />
          <PlayGameAuxiliarSection
            gamePhase={gamePhase}
            onClickNewGameButton={() => {
              setCanPlayGame(false);
              setPlayerOneGameAddress("");
              setPlayerTwoGameAddress("");
            }}
            onClickRulesButton={() => setRulesDialogIsOpen(true)}
            playerOneGameAddress={playerOneGameAddress}
            playerTwoGameAddress={playerTwoGameAddress}
          />
        </div>
        <PlayerColumnCard
          title={`Player 2${playerNumber === 2 ? " (You)" : ""}`}
        >
          <>
            {playerNumber === 1 && gamePhase === 1 && (
              <TextField
                id="p2-account-address"
                label="Player 2 wallet account address"
                disabled={fieldIsDisabled}
                sx={{ marginBottom: "5rem", width: "100%" }}
                onChange={(e) => setPlayerTwoAddress(e.target.value)}
                error={
                  playerTwoAddress !== "" &&
                  !addressRegex.test(playerTwoAddress)
                    ? true
                    : false
                }
                helperText={
                  playerTwoAddress !== "" &&
                  !addressRegex.test(playerTwoAddress)
                    ? "Wrong address format."
                    : ""
                }
              />
            )}
            {playerNumber === 2 && gamePhase === 2 && (
              <>
                <TextField
                  id="outlined-read-only-input"
                  label="Your bet (Wei)"
                  defaultValue={gameStake}
                  disabled
                  sx={{
                    marginBottom: ".5rem",
                    width: "100%",
                    input: {
                      "&:disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "all !important",
                      },
                    },
                  }}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <p className={styles.explanationText}>
                  You have to equal Player 1 bet.
                </p>
              </>
            )}
            {playerNumber === 1 && gamePhase === 2 && (
              <p className={styles.playerParagraph}>Deciding what choice...</p>
            )}
            {playerNumber === 2 && gamePhase === 2 && (
              <ChoiceSelector
                id="select-option-p2"
                playerChoice={playerTwoChoice}
                fieldIsDisabled={fieldIsDisabled}
                onChangeSelect={(event) =>
                  setPlayerTwoChoice(event.target.value as number)
                }
              />
            )}
            {playerNumber === 1 && gamePhase === 3 && (
              <p className={styles.playerParagraph}>
                Waiting for you to solve.
              </p>
            )}
            {playerNumber === 2 && gamePhase === 3 && (
              <>
                <PlayerChoiceVisibility
                  playerChoiceIsVisible={playerChoiceIsVisible}
                  playerChoiceName={GAME_CHOICES[playerTwoChoice]}
                  onClickVisibilityOff={() => setPlayerChoiceIsVisible(false)}
                  onClickVisibilityOn={() => setPlayerChoiceIsVisible(true)}
                />
                <TimeoutButton
                  counter={counter}
                  timeoutIsPending={timeoutIsPending}
                  onClickButton={() => playerTwoClicksTimeout()}
                >
                  Player 1 took too long to solve.
                  <br />
                  You can end (and win!) the game now.
                </TimeoutButton>
              </>
            )}
          </>
        </PlayerColumnCard>
      </div>
      <Dialog
        open={rulesDialogIsOpen}
        onClose={() => setRulesDialogIsOpen(false)}
      >
        <DialogTitle>Game Rules</DialogTitle>
        <DialogContent dividers>
          <img
            src={rulesImage}
            alt="Rock, Paper, Scissors, Lizard, Spock game rules."
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
