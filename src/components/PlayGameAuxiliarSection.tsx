import { ContentCopy } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import styles from "./PlayGameAuxiliarSection.module.scss";

type PlayGameAuxiliarSectionProps = {
  gamePhase: number;
  onClickNewGameButton: () => void;
  onClickRulesButton: () => void;
  playerOneGameAddress: string;
  playerTwoGameAddress: string;
};

function PlayGameAuxiliarSection({
  gamePhase,
  onClickNewGameButton,
  onClickRulesButton,
  playerOneGameAddress,
  playerTwoGameAddress,
}: PlayGameAuxiliarSectionProps) {
  return (
    <>
      <Button
        variant="contained"
        sx={{
          margin: "2rem",
          padding: "1rem",
          fontSize: "1.5rem",
          width: "fit-content",
        }}
        onClick={onClickRulesButton}
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
        onClick={onClickNewGameButton}
      >
        New Game
      </Button>
    </>
  );
}

export default PlayGameAuxiliarSection;
