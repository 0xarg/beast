import { Raydium } from "@raydium-io/raydium-sdk-v2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const { connection } = useConnection();

const wallet = useWallet();

// 2. Load your keypair (make sure it has devnet SOL)

// 3. Initialize Raydium for DEVNET

export const ConnectRaydium = async () => {
  return await Raydium.load({
    connection,
    owner: wallet.publicKey!,
    cluster: "devnet", // ← IMPORTANT: Set to devnet!
    disableFeatureCheck: true, // Optional: skip feature availability checks
    disableLoadToken: false,
    blockhashCommitment: "finalized",
  });
};
