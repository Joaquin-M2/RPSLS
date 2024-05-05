import { useEffect, useState } from "react";
import "./App.css";
import Button from "@mui/material/Button";

import { Check } from "@mui/icons-material";
import CreateGamePage from "./components/CreateGamePage";
import { useConnectedWalletAlertContext } from "./contexts/connectedWalletAlert-context";
import PlayGamePage from "./components/PlayGamePage";
import { useCanPlayGameContext } from "./contexts/canPlayGame-context";
import {
  AbstractProvider,
  BrowserProvider,
  JsonRpcSigner,
  ethers,
} from "ethers";
import { useGameAddressContext } from "./contexts/gameAddress-context";
import AppBar from "@mui/material/AppBar";

function App() {
  const { setShowConnectedWalletAlert } = useConnectedWalletAlertContext();
  const { canPlayGame, setCanPlayGame } = useCanPlayGameContext();
  const { setPlayerOneGameAddress, setPlayerTwoGameAddress } =
    useGameAddressContext();

  const [providerState, setProviderState] = useState<
    AbstractProvider | BrowserProvider | null
  >(null);
  const [signerState, setSignerState] = useState<JsonRpcSigner | null>(null);
  const [walletIsConnected, setWalletIsConnected] = useState(
    (JSON.parse(localStorage.getItem("walletIsConnected")!) && signerState) ||
      false
  );

  const initializeProvider = async () => {
    if (window.ethereum == null) {
      // If MetaMask is not installed, we use the default provider,
      // which is backed by a variety of third-party services (such
      // as INFURA). They do not have private keys installed,
      // so they only have read-only access
      console.log("MetaMask not installed; using read-only defaults");
      const provider: AbstractProvider = ethers.getDefaultProvider();
      setProviderState(provider);
    } else {
      // Connect to the MetaMask EIP-1193 object. This is a standard
      // protocol that allows Ethers access to make all read-only
      // requests through MetaMask.
      const provider: BrowserProvider = new ethers.BrowserProvider(
        window.ethereum
      );
      setProviderState(provider);

      // It also provides an opportunity to request access to write
      // operations, which will be performed by the private key
      // that MetaMask manages for the user.
      const signer: JsonRpcSigner = await provider.getSigner();
      setSignerState(signer);
    }
    localStorage.setItem("walletIsConnected", JSON.stringify(true));
    setWalletIsConnected(true);
  };

  const logoutUser = async () => {
    await window.ethereum?.request({
      method: "wallet_revokePermissions",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  };

  const handleButtonClick = () => {
    if (!walletIsConnected) {
      setShowConnectedWalletAlert(false);
      initializeProvider();
    } else {
      setCanPlayGame(false);
      logoutUser();
      setPlayerOneGameAddress("");
      setPlayerTwoGameAddress("");
    }
  };

  useEffect(() => {
    if (!signerState && walletIsConnected) {
      localStorage.removeItem("walletIsConnected");
      logoutUser();
    }
    const handleAccountsChanged = () => {
      localStorage.removeItem("walletIsConnected");
      setWalletIsConnected(false);
      setProviderState(null);
      setSignerState(null);
    };
    const checkIfAccountChanged = async () => {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    };
    checkIfAccountChanged();

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [signerState, providerState]);

  useEffect(() => {
    logoutUser();
  }, []);

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#eaeaea" }}>
        <Button
          variant="contained"
          onClick={handleButtonClick}
          sx={{ margin: "2rem", alignSelf: "flex-start" }}
        >
          {walletIsConnected ? "Wallet is Connected" : "Connect Wallet"}
          {walletIsConnected && <Check sx={{ marginLeft: "1rem" }} />}
        </Button>
      </AppBar>
      {canPlayGame ? (
        <PlayGamePage signer={signerState!} />
      ) : (
        <CreateGamePage
          walletIsConnected={walletIsConnected}
          signer={signerState!}
        />
      )}
    </>
  );
}

export default App;
