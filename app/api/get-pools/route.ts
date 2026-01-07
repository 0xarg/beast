import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import cpSwapIdl from "../../lib/raydium/idl/raydium_cp_swap.json";

const CP_SWAP_PROGRAM_ID = new PublicKey(
  "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", // from lib.rs
);

export async function GET() {
  (async () => {
    const connection = new Connection("https://api.devnet.solana.com");

    const dummyWallet = {
      publicKey: new PublicKey("11111111111111111111111111111111"),
      signTransaction: async () => {},
      signAllTransactions: async () => {},
    };

    const provider = new AnchorProvider(connection, dummyWallet as any, {});
    const program = new Program(cpSwapIdl as any, provider) as any;

    const pools = await program.account.poolState.all();

    console.log("Found pools:", pools.length);

    pools.forEach((p: any, i: any) => {
      console.log(i, p.publicKey.toBase58());
    });
  })();
}
