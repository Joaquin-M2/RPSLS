import { Contract, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { HASHER_ADDRESS } from "../contracts/hasher-address";
import { HASHER_ABI } from "../contracts/hasher-abi";

export function useHasherContract(signer: JsonRpcSigner) {
  const [hasherContract, setHasherContract] = useState<Contract | null>(null);

  useEffect(() => {
    const hasherContract = new Contract(HASHER_ADDRESS, HASHER_ABI, signer);
    setHasherContract(hasherContract);
  }, []);

  return [hasherContract];
}
