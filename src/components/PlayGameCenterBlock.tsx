import Button from "@mui/material/Button";
import styles from "./PlayGameCenterBlock.module.scss";
import { addressRegex } from "../utils/address-regex";
import { useGamePhaseContext } from "../contexts/gamePhase-context";

type PlayGameCenterBlockProps = {
  handleStartGameClick: () => Promise<void>;
  playerOneBet: number;
  playerOneChoice: number;
  playerTwoAddress: string;
};

export default function PlayGameCenterBlock({
  handleStartGameClick,
  playerOneBet,
  playerOneChoice,
  playerTwoAddress,
}: PlayGameCenterBlockProps) {
  const { playerNumber, setPlayerNumber, gamePhase, setGamePhase } =
    useGamePhaseContext();

  const startGameButton = (
    <Button
      variant="contained"
      sx={{ margin: "10rem 0 20rem", padding: "3rem", fontSize: "3rem" }}
      onClick={handleStartGameClick}
      disabled={
        !playerOneBet ||
        !playerOneChoice ||
        !playerTwoAddress ||
        !addressRegex.test(playerTwoAddress)
      }
    >
      Start Game!
    </Button>
  );

  const playButton = (
    <Button
      variant="contained"
      sx={{ margin: "10rem 0 20rem", padding: "3rem", fontSize: "3rem" }}
    >
      Play!
    </Button>
  );

  const solveButton = (
    <Button
      variant="contained"
      sx={{ margin: "10rem 0 20rem", padding: "3rem", fontSize: "3rem" }}
    >
      Solve!
    </Button>
  );

  const gameResult = (
    <div className={styles.resultWrapper}>
      <p className={styles.vsParagraph}>
        XXXXXXXXXX
        <span className={styles.vs}>VS</span>
        YYYYYYYYYY
      </p>
      <p className={styles.resultParagraph}>XXXXXXXX defeats YYYYYYYY</p>
    </div>
  );

  return (
    <>
      {gamePhase === 1 && startGameButton}
      {gamePhase === 2 && playButton}
      {gamePhase === 3 && solveButton}
      {gamePhase === 4 && gameResult}
    </>
  );
}
