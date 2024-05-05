import { Button } from "@mui/material";
import formatTimeout from "../utils/format-time-timout";
import styles from "./TimeoutButton.module.scss";
import LoadingCircle from "./LoadingCircle";

type TimeoutButtonProps = {
  children: (string | JSX.Element)[];
  counter: number;
  onClickButton: () => void;
  timeoutIsPending: boolean;
};

export default function TimeoutButton({
  children,
  counter,
  onClickButton,
  timeoutIsPending,
}: TimeoutButtonProps) {
  return (
    <div>
      <p className={styles.timeoutTimer}>{formatTimeout(counter)}</p>
      <Button
        variant="contained"
        sx={{
          marginBottom: ".5rem",
        }}
        onClick={onClickButton}
        disabled={!!counter || timeoutIsPending}
      >
        {timeoutIsPending ? <LoadingCircle /> : "Timeout!"}
      </Button>
      {counter === 0 && <p className={styles.explanationText}>{children}</p>}
    </div>
  );
}
