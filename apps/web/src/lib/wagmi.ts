import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { polygonAmoy } from "wagmi/chains";

export function getWagmiConfig() {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

  // If no WalletConnect/Reown project id is configured, fall back to injected wallets only.
  // This avoids Reown remote config fetch during builds and still lets MetaMask/Browser wallets work.
  if (!projectId) {
    return createConfig({
      chains: [polygonAmoy],
      connectors: [injected()],
      transports: {
        [polygonAmoy.id]: http(),
      },
      ssr: false,
    });
  }

  return getDefaultConfig({
    appName: "Personal Data Economy Wallet",
    projectId,
    chains: [polygonAmoy],
    ssr: false,
  });
}
