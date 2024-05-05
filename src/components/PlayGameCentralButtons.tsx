import Button from "@mui/material/Button";
import styles from "./PlayGameCentralButtons.module.scss";
import { addressRegex } from "../utils/address-regex";
import LoadingCircle from "./LoadingCircle";

type PlayGameCentralButtonsProps = {
  gamePhase: number;
  onClickPlayGameButton: () => void;
  onClickSolveGameButton: () => void;
  onClickStartGameButton: () => void;
  solveButtonIsDisabled: boolean;
  playButtonIsPending: boolean;
  playerNumber: number;
  playerOneBet: number;
  playerOneChoice: number;
  playerOneEndGameMessage: string;
  playerTwoAddress: string;
  playerTwoEndGameMessage: string;
  solveButtonIsPending: boolean;
  startGameButtonIsPending: boolean;
};

export default function PlayGameCentralButtons({
  gamePhase,
  onClickPlayGameButton,
  onClickSolveGameButton,
  onClickStartGameButton,
  solveButtonIsDisabled,
  playButtonIsPending,
  playerNumber,
  playerOneBet,
  playerOneChoice,
  playerOneEndGameMessage,
  playerTwoAddress,
  playerTwoEndGameMessage,
  solveButtonIsPending,
  startGameButtonIsPending,
}: PlayGameCentralButtonsProps) {
  const solveButtonDisabledState = () => {
    if (solveButtonIsPending || solveButtonIsDisabled) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {playerNumber === 1 && gamePhase === 1 && (
        <Button
          variant="contained"
          sx={{
            margin: "10rem 0 20rem",
            padding: "3rem",
            fontSize: "3rem",
          }}
          onClick={onClickStartGameButton}
          disabled={
            !playerOneBet ||
            !playerOneChoice ||
            !playerTwoAddress ||
            !addressRegex.test(playerTwoAddress) ||
            startGameButtonIsPending
          }
        >
          {startGameButtonIsPending ? <LoadingCircle /> : "Start Game!"}
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
          onClick={onClickPlayGameButton}
          disabled={playButtonIsPending}
        >
          {playButtonIsPending ? <LoadingCircle /> : "Play!"}
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
          onClick={onClickSolveGameButton}
          disabled={solveButtonDisabledState()}
        >
          {solveButtonIsPending ? <LoadingCircle /> : "Solve!"}
        </Button>
      )}
      {gamePhase === 4 && (
        <div className={styles.endGameMessageContainer}>
          {playerNumber === 1 && (
            <p className={styles.endGameMessage}>{playerOneEndGameMessage}</p>
          )}
          {playerNumber === 2 && (
            <p className={styles.endGameMessage}>{playerTwoEndGameMessage}</p>
          )}
        </div>
      )}
    </>
  );
}
