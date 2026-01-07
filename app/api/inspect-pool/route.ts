import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import cpSwapIdl from "@/lib/raydium/idl/raydium_cp_swap.json";

import cpSwapIdl from "../../lib/raydium/idl/raydium_cp_swap.json";

const CP_SWAP_PROGRAM_ID = new PublicKey(
  "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", // devnet program id from lib.rs
);

export async function GET() {
  const connection = new Connection("https://api.devnet.solana.com");

  // Dummy wallet — read-only
  const dummyWallet = {
    publicKey: new PublicKey("11111111111111111111111111111111"),
    signTransaction: async () => {},
    signAllTransactions: async () => {},
  };

  const provider = new AnchorProvider(connection, dummyWallet as any, {});
  const program = new Program(cpSwapIdl as any, provider) as any;

  const poolState = new PublicKey("PUT_POOL_ADDRESS_HERE");

  const pool = await program.account.poolState.fetch(poolState);

  return NextResponse.json({
    mintA: pool.mintA.toBase58(),
    mintB: pool.mintB.toBase58(),
    vaultA: pool.vaultA.toBase58(),
    vaultB: pool.vaultB.toBase58(),
    reserveA: pool.reserveA.toString(),
    reserveB: pool.reserveB.toString(),
    feeRate: pool.feeRate,
  });
}
