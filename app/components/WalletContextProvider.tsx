"use client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode } from "react";

export default function WalletContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const alchemyDevnet: string =
    "https://solana-devnet.g.alchemy.com/v2/nsie4CkPWDSvgFDKT6Yhg";
  const solanaDevnet = "https://api.devnet.solana.com";
  return (
    <div className="flex gap-2">
      <ConnectionProvider endpoint={solanaDevnet}>
        <WalletProvider wallets={[]} autoConnect={true}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
