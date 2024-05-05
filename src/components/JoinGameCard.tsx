import { forwardRef } from "react";

import { Button, TextField } from "@mui/material";
import LoadingCircle from "./LoadingCircle";

import styles from "./JoinGameCard.module.scss";

type JoinGameCardProps = {
  walletIsConnected: boolean;
  joinPlayerError: string | boolean;
  onChangeInput: (e: React.ChangeEvent) => void;
  playerCanJoin: boolean | string;
  onClickButton: () => void;
  joinPlayerIsPending: boolean | string;
  children: JSX.Element;
};

const JoinGameCard = forwardRef<HTMLInputElement, JoinGameCardProps>(
  (
    {
      walletIsConnected,
      joinPlayerError,
      onChangeInput,
      playerCanJoin,
      onClickButton,
      joinPlayerIsPending,
      children,
    },
    ref
  ) => {
    return (
      <>
        <div className={styles.joinGameWrapper}>
          {children}
          <div className={styles.joinGameAddressWrapper}>
            <TextField
              disabled={!walletIsConnected}
              error={!!joinPlayerError}
              helperText={joinPlayerError}
              id="outlined-basic"
              label="Game (Smart Contract) Address"
              onChange={onChangeInput}
              inputRef={ref}
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
              disabled={!playerCanJoin || !walletIsConnected}
              variant="contained"
              sx={{
                position: "absolute",
                bottom: 0,
                "&:disabled": {
                  cursor: "not-allowed",
                  pointerEvents: "all !important",
                },
              }}
              onClick={onClickButton}
            >
              {joinPlayerIsPending ? <LoadingCircle /> : "Join the game!"}
            </Button>
          </div>
        </div>
      </>
    );
  }
);

export default JoinGameCard;
