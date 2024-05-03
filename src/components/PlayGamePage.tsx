import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ContentCopy, Visibility, VisibilityOff } from "@mui/icons-material";
import rulesImage from "../assets/rpsls-rules.jpg";

import styles from "./PlayGamePage.module.scss";
import { useEffect, useState } from "react";
import { HASHER_ABI } from "../contracts/hasher-abi";
import { RPSLS_ABI } from "../contracts/rpsls-abi";
import { RPSLS_BYTECODE } from "../contracts/rpsls-bytecode";
import { Contract, JsonRpcSigner, ethers } from "ethers";
import { HASHER_ADDRESS } from "../contracts/hasher-address";
import { addressRegex } from "../utils/address-regex";
import formatTimeout from "../utils/format-time-timout";
import { useGamePhaseContext } from "../contexts/gamePhase-context";
import { useGameAddressContext } from "../contexts/gameAddress-context";
import { useGameDataContext } from "../contexts/gameData-context";
import { useCanPlayGameContext } from "../contexts/canPlayGame-context";

type PlayGamePageProps = {
  signer: JsonRpcSigner;
};

type PlayerOneGameData = {
  playerOneAddress: string;
  gameAddress: string;
  c1Move: number;
  salt: number;
  solvedWithoutTimeout: boolean;
};

export default function PlayGamePage({ signer }: PlayGamePageProps) {
  const [salt, setSalt] = useState<number | null>(null);
  const [playerOneChoice, setPlayerOneChoice] = useState(0);
  const [playerOneChoiceName, setPlayerOneChoiceName] = useState<string | null>(
    ""
  );
  const [playerTwoChoice, setPlayerTwoChoice] = useState(0);
  const [playerOneBet, setPlayOneBet] = useState(0);
  const [totalBet, setTotalBet] = useState(0);
  const [playerTwoAddress, setPlayerTwoAddress] = useState("");
  const [rulesDialogIsOpen, setRulesDialogIsOpen] = useState(false);
  const [hasherContract, setHasherContract] = useState<Contract | null>(null);
  const [playerOneAlert, setPlayerOneAlert] = useState(
    'Make sure your browser localStorage is not altered. Otherwise this game will only be finished by Player 2 by clicking on the "TIMEOUT" button.'
  );
  const [playerChoiceIsVisible, setPlayerChoiceIsVisible] = useState(false);
  const { gamePhase, setGamePhase, playerNumber } = useGamePhaseContext();
  const {
    playerOneGameAddress,
    playerTwoGameAddress,
    setPlayerOneGameAddress,
    setPlayerTwoGameAddress,
  } = useGameAddressContext();
  const { gameStake, setGameStake, lastAction, setLastAction } =
    useGameDataContext();
  const { setCanPlayGame } = useCanPlayGameContext();
  const GAME_CHOICES = [null, "Rock", "Paper", "Scissors", "Spock", "Lizard"];
  const [timesPolled, setTimesPolled] = useState(0);
  const [startGameButtonIsPending, setStartGameButtonIsPending] =
    useState(false);
  const [playButtonIsPending, setPlayButtonIsPending] = useState(false);
  const [solveButtonIsPending, setSolveButtonIsPending] = useState(false);
  const [timeoutIsPending, setTimeoutIsPending] = useState(false);
  const [fieldIsDisabled, setFieldIsDisabled] = useState(false);
  const [afterBetPlayerTwoBalance, setAfterBetPlayerTwoBalance] = useState<
    bigint | null
  >(null);
  const [playerOneEndGameMessage, setPlayerOneEndGameMessage] =
    useState("Timeout! You lose!");
  const [playerTwoEndGameMessage, setPlayerTwoEndGameMessage] = useState("");

  //////////////////////////////////////
  // POLLING

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
      }, 5000);
    }

    return () => {
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [timesPolled]);

  //////////////////////////////////////
  // SALT

  useEffect(() => {
    const typedArray = new Uint32Array(1);
    const cryptographicallySecureRandomNumber =
      crypto.getRandomValues(typedArray)[0];
    setSalt(cryptographicallySecureRandomNumber);
  }, []);

  //////////////////////////////////////
  // START GAME

  useEffect(() => {
    const hasherContract = new Contract(HASHER_ADDRESS, HASHER_ABI, signer);
    setHasherContract(hasherContract);
  }, []);

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

  const getGameContractAddress = (deployedContract: ethers.BaseContract) => {
    return deployedContract.target;
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
      const gameContractAddress = getGameContractAddress(
        gameContractDeployment
      );
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

      setTimesPolled(1); // Activate useEffect(polling).
    } catch (error) {
      setStartGameButtonIsPending(false);
      setFieldIsDisabled(false);
    }
  };

  useEffect(() => {
    if (playerNumber !== 1) return;
    if (gamePhase > 1 && JSON.parse(localStorage.getItem("startedGames")!)) {
      setPlayerOneAlert(
        'Make sure your browser localStorage is not altered. Otherwise this game will only be finished by Player 2 by clicking on the "TIMEOUT" button.'
      );
    } else {
      setPlayerOneAlert(
        'It seems your browser localStorage was altered. The game will have to be finished by Player 2 by clicking on the "TIMEOUT" button.'
      );
    }
  }, [gamePhase]);

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

  //////////////////////////////////////
  // SOLVE GAME

  /* useEffect(() => {
    const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
    if (!startedGames) return;
    const currentGameIndex = startedGames.findIndex(
      (game: PlayerOneGameData) => game.gameAddress === playerOneGameAddress
    );
    const currentGame = startedGames[currentGameIndex];
    setPlayerOneGameData(currentGame);
  }, []); */

  const solveGame = async () => {
    try {
      const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
      if (!startedGames) {
        setPlayerOneAlert(
          'It seems your browser localStorage was altered. The game will have to be finished by Player 2 by clicking on the "TIMEOUT" button.'
        );
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

      const updateStartedGames = () => {
        const updatedCurrentGame = {
          ...currentGame,
          solvedWithoutTimeout: false,
        };
        startedGames.splice(currentGameIndex, 1);
        const updatedStartedGames = [...startedGames, updatedCurrentGame];
        localStorage.setItem(
          "startedGames",
          JSON.stringify(updatedStartedGames)
        );
      };
      updateStartedGames();

      const createPlayerOneEndGameMessage = async () => {
        const playerOneMove = currentGame.c1Move;
        const playerTwoMove = await gameContract.c2();
        const checkWinner = await gameContract.win(
          playerOneMove,
          playerTwoMove
        );
        if (playerOneMove === Number(playerTwoMove)) {
          setPlayerOneEndGameMessage("It's a tie!");
        } else if (checkWinner === true) {
          setPlayerOneEndGameMessage("You win!");
        } else if (checkWinner === false) {
          setPlayerOneEndGameMessage("You lose!");
        }
      };
      createPlayerOneEndGameMessage().then(() => setGamePhase(4));
      /**
       * User's browser localStorage should be deleted to not bloat it with data from finished games.
       * Nevertheless, if we don't want to use a centralized database we have to rely on localStorage to make the app a bit more robust.
       *
       * startedGames.splice(currentGameIndex, 1);
       */
      /* if (startedGames.length === 0) {
        localStorage.removeItem("startedGames");
      } else {
        localStorage.setItem("startedGames", JSON.stringify(startedGames));
      } */
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

      setAfterBetPlayerTwoBalance(null);
    }
  }, [gamePhase]);

  //////////////////////////////////////
  // SET WINNER

  useEffect(() => {
    // To set the winner on Player 1 browser we use the .win() method from the smart contract.
    if (gamePhase === 1) return;

    const createPlayerTwoEndGameMessage = async () => {
      const gameContract = new Contract(
        playerOneGameAddress || playerTwoGameAddress,
        RPSLS_ABI,
        signer
      );
      const playerTwoCommitment = await gameContract.c2();
      if (gamePhase === 3) {
        const playerBalance = await signer.provider.getBalance(signer.address);
        setAfterBetPlayerTwoBalance(playerBalance);
      }
      if (gamePhase === 4 && playerTwoCommitment) {
        const gameStakeToBigInt = BigInt(gameStake);
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
    };

    if (playerNumber === 2) createPlayerTwoEndGameMessage();
  }, [gamePhase]);

  //////////////////////////////////////
  // TIMEOUT

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (lastAction! + 300 - Date.parse(String(new Date())) / 1000 > 0) {
      setCounter(lastAction! + 300 - Date.parse(String(new Date())) / 1000);
    } else {
      setCounter(0);
    }
    let timer: NodeJS.Timeout;
    if (gamePhase === 1 || counter <= 0) return;

    if (counter > 0) {
      timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [counter, lastAction, gamePhase]);

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

  //////////////////////////////////////
  // PREVENT NEGATIVE VALUES ON BET

  const preventMinus = (e: React.KeyboardEvent) => {
    if (
      e.code === "Minus" ||
      e.code === "Slash" ||
      e.code === "NumpadSubtract"
    ) {
      e.preventDefault();
    }
  };

  const preventPasteNegative = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = parseFloat(clipboardData.getData("text"));

    if (pastedData < 0) {
      e.preventDefault();
    }
  };

  //////////////////////////////////////
  // GET PLAYER 1 SELECTION

  useEffect(() => {
    if (
      playerNumber !== 1 ||
      !JSON.parse(localStorage.getItem("startedGames")!)
    )
      return;

    if (gamePhase === 2 || gamePhase === 3) {
      const getPlayerOneSelection = () => {
        const startedGames = JSON.parse(localStorage.getItem("startedGames")!);
        const playerOneSelection = startedGames.find(
          (game: PlayerOneGameData) =>
            game.gameAddress.toLowerCase() ===
            playerOneGameAddress.toLowerCase()
        ).c1Move;
        return GAME_CHOICES[playerOneSelection];
      };

      const playerOneSelection = getPlayerOneSelection();
      setPlayerOneChoiceName(playerOneSelection);
    }
  }, [gamePhase]);

  //////////////////////////////////////
  // LOADING COMPONENT

  const loadingCircle = (
    <Box sx={{}}>
      <CircularProgress />
    </Box>
  );

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
      <div className={styles.totalBetIndicatorWrapper}>
        <div className={styles.totalBetIndicator}>
          Total Amount Bet: {totalBet} Wei
        </div>
        <a href="https://eth-converter.com/" target="_blank">
          ETH - Gwei - Wei converter
        </a>
      </div>
      <div className={styles.playersWrapper}>
        <div className={styles.playerColumn}>
          <h3 className={styles.playerTitle}>
            Player 1{playerNumber === 1 && " (You)"}
          </h3>
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
                  onPaste={preventPasteNegative}
                  onKeyDown={preventMinus}
                  onChange={(e) => setPlayOneBet(+e.target.value)}
                />
                <a href="https://eth-converter.com/" target="_blank">
                  ETH - Gwei - Wei converter
                </a>
              </div>
              <FormControl fullWidth sx={{ marginBottom: "5rem" }}>
                <InputLabel id="select-option-p1">
                  Select your choice
                </InputLabel>
                <Select
                  labelId="select-option-p1"
                  id="select-option-p1"
                  value={playerOneChoice}
                  label="Select your choice"
                  disabled={fieldIsDisabled}
                  onChange={(event) =>
                    setPlayerOneChoice(event.target.value as number)
                  }
                  sx={{ width: "100%" }}
                >
                  <MenuItem value={0} sx={{ display: "none" }}></MenuItem>
                  <MenuItem value={1}>Rock</MenuItem>
                  <MenuItem value={2}>Paper</MenuItem>
                  <MenuItem value={3}>Scissors</MenuItem>
                  <MenuItem value={4}>Spock</MenuItem>
                  <MenuItem value={5}>Lizard</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          {playerNumber === 1 && (gamePhase === 2 || gamePhase === 3) && (
            <>
              <div className={styles.playerChoiceWrapper}>
                <p className={styles.playerChoice}>
                  Your choice:{" "}
                  <span
                    className={
                      !playerChoiceIsVisible ? styles.playerChoiceHidden : ""
                    }
                  >
                    {playerOneChoiceName}
                  </span>
                </p>
                <IconButton
                  aria-label="Show choice"
                  sx={{
                    display: playerChoiceIsVisible ? "block" : "none",
                    width: "fit-content",
                  }}
                  onClick={() => setPlayerChoiceIsVisible(false)}
                >
                  <VisibilityOff />
                </IconButton>
                <IconButton
                  aria-label="Hide choice"
                  sx={{
                    display: !playerChoiceIsVisible ? "block" : "none",
                    width: "fit-content",
                  }}
                  onClick={() => setPlayerChoiceIsVisible(true)}
                >
                  <Visibility />
                </IconButton>
              </div>
            </>
          )}
          {playerNumber === 1 && gamePhase === 2 && (
            <div>
              <p className={styles.timeoutTimer}>{formatTimeout(counter)}</p>
              <Button
                variant="contained"
                sx={{
                  marginBottom: ".5rem",
                }}
                disabled={!!counter || timeoutIsPending}
                onClick={() => playerOneClicksTimeout()}
              >
                {timeoutIsPending ? loadingCircle : "Timeout!"}
              </Button>
              {counter === 0 && (
                <p className={styles.explanationText}>
                  Player 2 took too long to play.
                  <br />
                  You can end the game now.
                </p>
              )}
            </div>
          )}
          {playerNumber === 2 && gamePhase === 2 && (
            <p className={styles.playerParagraph}>Waiting your move.</p>
          )}
          {playerNumber === 2 && gamePhase === 3 && (
            <p className={styles.playerParagraph}>Solving...</p>
          )}
        </div>
        <div className={styles.centerWrapper}>
          {playerNumber === 1 && gamePhase === 1 && (
            <Button
              variant="contained"
              sx={{
                margin: "10rem 0 20rem",
                padding: "3rem",
                fontSize: "3rem",
              }}
              onClick={startGame}
              disabled={
                !playerOneBet ||
                !playerOneChoice ||
                !playerTwoAddress ||
                !addressRegex.test(playerTwoAddress) ||
                startGameButtonIsPending
              }
            >
              {startGameButtonIsPending ? loadingCircle : "Start Game!"}
            </Button>
          )}
          {playerNumber === 2 && gamePhase === 2 && (
            <Button
              variant="contained"
              sx={{
                margin: "10rem 0 20rem",
                padding: "3rem",
                fontSize: "3rem",
              }}
              onClick={playGame}
              disabled={playButtonIsPending}
            >
              {playButtonIsPending ? loadingCircle : "Play!"}
            </Button>
          )}
          {playerNumber === 1 && gamePhase === 3 && (
            <Button
              variant="contained"
              sx={{
                margin: "10rem 0 20rem",
                padding: "3rem",
                fontSize: "3rem",
              }}
              onClick={solveGame}
              disabled={solveButtonIsPending}
            >
              {solveButtonIsPending ? loadingCircle : "Solve!"}
            </Button>
          )}
          {gamePhase === 4 && (
            <div className={styles.endGameMessageContainer}>
              {playerNumber === 1 && (
                <p className={styles.endGameMessage}>
                  {playerOneEndGameMessage}
                </p>
              )}
              {playerNumber === 2 && (
                <p className={styles.endGameMessage}>
                  {playerTwoEndGameMessage}
                </p>
              )}
            </div>
          )}
          <Button
            variant="contained"
            sx={{
              margin: "2rem",
              padding: "1rem",
              fontSize: "1.5rem",
              width: "fit-content",
            }}
            onClick={() => setRulesDialogIsOpen(true)}
          >
            Rules
          </Button>
          {gamePhase >= 2 && (
            <div className={styles.gameAddressWrapper}>
              <IconButton
                aria-label="Copy game address"
                onClick={() =>
                  navigator.clipboard.writeText(
                    playerOneGameAddress || playerTwoGameAddress
                  )
                }
                sx={{ marginRight: "1rem" }}
              >
                <ContentCopy />
              </IconButton>
              <p className={styles.gameAddress}>
                <span className={styles.gameAddressTitle}>
                  Game (contract) Address:
                </span>{" "}
                {playerOneGameAddress || playerTwoGameAddress}{" "}
              </p>
            </div>
          )}
          <Button
            variant="contained"
            sx={{
              margin: "2rem",
              padding: "1rem",
              fontSize: "1.5rem",
              width: "fit-content",
            }}
            onClick={() => {
              setCanPlayGame(false);
              setPlayerOneGameAddress("");
              setPlayerTwoGameAddress("");
            }}
          >
            New Game
          </Button>
        </div>
        <div className={styles.playerColumn}>
          <h3 className={styles.playerTitle}>
            Player 2{playerNumber === 2 && " (You)"}
          </h3>
          {playerNumber === 1 && gamePhase === 1 && (
            <TextField
              id="p2-account-address"
              label="Player 2 wallet account address"
              disabled={fieldIsDisabled}
              sx={{ marginBottom: "5rem", width: "100%" }}
              onChange={(e) => setPlayerTwoAddress(e.target.value)}
              error={
                playerTwoAddress !== "" && !addressRegex.test(playerTwoAddress)
                  ? true
                  : false
              }
              helperText={
                playerTwoAddress !== "" && !addressRegex.test(playerTwoAddress)
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
            <FormControl fullWidth sx={{ marginBottom: "5rem" }}>
              <InputLabel id="select-option-p2">Select your choice</InputLabel>
              <Select
                labelId="select-option-p2"
                id="select-option-p2"
                disabled={fieldIsDisabled}
                value={playerTwoChoice}
                label="Select your choice"
                onChange={(event) =>
                  setPlayerTwoChoice(event.target.value as number)
                }
                sx={{ width: "100%" }}
              >
                <MenuItem value={0} sx={{ display: "none" }}></MenuItem>
                <MenuItem value={1}>Rock</MenuItem>
                <MenuItem value={2}>Paper</MenuItem>
                <MenuItem value={3}>Scissors</MenuItem>
                <MenuItem value={4}>Spock</MenuItem>
                <MenuItem value={5}>Lizard</MenuItem>
              </Select>
            </FormControl>
          )}
          {playerNumber === 1 && gamePhase === 3 && (
            <p className={styles.playerParagraph}>Waiting for you to solve.</p>
          )}
          {playerNumber === 2 && gamePhase === 3 && (
            <>
              <div className={styles.playerChoiceWrapper}>
                <p className={styles.playerChoice}>
                  Your choice:{" "}
                  <span
                    className={
                      !playerChoiceIsVisible ? styles.playerChoiceHidden : ""
                    }
                  >
                    {GAME_CHOICES[playerTwoChoice]}
                  </span>
                </p>
                <IconButton
                  aria-label="Show choice"
                  sx={{
                    display: playerChoiceIsVisible ? "block" : "none",
                    width: "fit-content",
                  }}
                  onClick={() => setPlayerChoiceIsVisible(false)}
                >
                  <VisibilityOff />
                </IconButton>
                <IconButton
                  aria-label="Hide choice"
                  sx={{
                    display: !playerChoiceIsVisible ? "block" : "none",
                    width: "fit-content",
                  }}
                  onClick={() => setPlayerChoiceIsVisible(true)}
                >
                  <Visibility />
                </IconButton>
              </div>
              <div>
                <p className={styles.timeoutTimer}>{formatTimeout(counter)}</p>
                <Button
                  variant="contained"
                  sx={{
                    marginBottom: ".5rem",
                  }}
                  onClick={() => playerTwoClicksTimeout()}
                  disabled={!!counter || timeoutIsPending}
                >
                  {timeoutIsPending ? loadingCircle : "Timeout!"}
                </Button>
                {counter === 0 && (
                  <p className={styles.explanationText}>
                    Player 1 took too long to solve.
                    <br />
                    You can end (and win!) the game now.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
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
