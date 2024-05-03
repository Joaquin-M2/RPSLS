import { Contract, JsonRpcSigner } from "ethers";
import { RPSLS_ABI } from "../contracts/rpsls-abi";

export default async function calculateGamePhase(
  gameAddress: string,
  signer: JsonRpcSigner
) {
  /**
   * GAME PHASES:
   *
   * 1.- J1: Start!
   * 2.- J1: Waiting for J2
   * 2.- J2: Play!
   * 3.- J1: Solve!
   * 3.- J2: Waiting for J1
   * 4.- J1 & J2: Results
   */
  const gameContract = new Contract(gameAddress, RPSLS_ABI, signer);

  //const playerOneAddress = await gameContract.j1();
  const playerTwoAddress = await gameContract.j2();
  //const playerOneHashedCommitment = await gameContract.c1Hash();
  const playerTwoCommitment = await gameContract.c2();
  const stake = await gameContract.stake();

  // Both players played OR any of the players clicked the Timeout button:
  if (!stake) {
    return 4;
  }

  if (playerTwoAddress && !playerTwoCommitment) {
    return 2;
  }

  if (playerTwoCommitment) {
    return 3;
  }

  // if (!playerTwoAddress) {}
  return 1;
}
