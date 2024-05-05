import { useEffect, useState } from "react";

export function useSalt() {
  const [salt, setSalt] = useState<number | null>(null);

  useEffect(() => {
    const typedArray = new Uint32Array(1);
    const cryptographicallySecureRandomNumber =
      crypto.getRandomValues(typedArray)[0];
    setSalt(cryptographicallySecureRandomNumber);
  }, []);

  return [salt];
}
