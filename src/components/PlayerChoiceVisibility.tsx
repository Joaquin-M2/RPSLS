import { IconButton } from "@mui/material";
import styles from "./PlayerChoiceVisibility.module.scss";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type PlayerChoiceVisibilityProps = {
  playerChoiceIsVisible: boolean;
  playerChoiceName: string | null;
  onClickVisibilityOff: () => void;
  onClickVisibilityOn: () => void;
};

function PlayerChoiceVisibility({
  playerChoiceIsVisible,
  playerChoiceName,
  onClickVisibilityOff,
  onClickVisibilityOn,
}: PlayerChoiceVisibilityProps) {
  return (
    <div className={styles.playerChoiceWrapper}>
      <p className={styles.playerChoice}>
        Your choice:{" "}
        <span
          className={!playerChoiceIsVisible ? styles.playerChoiceHidden : ""}
        >
          {playerChoiceName}
        </span>
      </p>
      <IconButton
        aria-label="Show choice"
        sx={{
          display: playerChoiceIsVisible ? "block" : "none",
          width: "fit-content",
        }}
        onClick={onClickVisibilityOff}
      >
        <VisibilityOff />
      </IconButton>
      <IconButton
        aria-label="Hide choice"
        sx={{
          display: !playerChoiceIsVisible ? "block" : "none",
          width: "fit-content",
        }}
        onClick={onClickVisibilityOn}
      >
        <Visibility />
      </IconButton>
    </div>
  );
}

export default PlayerChoiceVisibility;
