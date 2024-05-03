import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import ConnectedWalletAlertProvider from "./contexts/connectedWalletAlert-context.tsx";
import CanPlayGameProvider from "./contexts/canPlayGame-context.tsx";
import GamePhaseProvider from "./contexts/gamePhase-context.tsx";
import GameAddressProvider from "./contexts/gameAddress-context.tsx";
import GameDataProvider from "./contexts/gameData-context.tsx";

const theme = createTheme({
  typography: {
    htmlFontSize: 10,
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GameAddressProvider>
        <GameDataProvider>
          <GamePhaseProvider>
            <ConnectedWalletAlertProvider>
              <CanPlayGameProvider>
                <App />
              </CanPlayGameProvider>
            </ConnectedWalletAlertProvider>
          </GamePhaseProvider>
        </GameDataProvider>
      </GameAddressProvider>
    </ThemeProvider>
  </React.StrictMode>
);
