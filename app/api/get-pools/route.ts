// import { Connection, PublicKey } from "@solana/web3.js";
// import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import cpSwapIdl from "@/lib/raydium/idl/raydium_cp_swap.json";

// // CP-Swap program ID — MUST match declare_id! in lib.rs
// const CP_SWAP_PROGRAM_ID = new PublicKey(
//   "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
// );

// export async function GET() {
//   try {
//     // 1. Connection
//     const connection = new Connection("https://api.devnet.solana.com");

//     // 2. Dummy wallet (read-only; no signing)
//     const dummyWallet = {
//       publicKey: new PublicKey("11111111111111111111111111111111"),
//       signTransaction: async () => {
//         throw new Error("read-only");
//       },
//       signAllTransactions: async () => {
//         throw new Error("read-only");
//       },
//     };

//     // 3. Anchor provider
//     const provider = new AnchorProvider(connection, dummyWallet as any, {
//       commitment: "confirmed",
//     });

//     // 4. Program (IDL + PROGRAM ID + PROVIDER)
//     const program = new Program(cpSwapIdl as any, CP_SWAP_PROGRAM_ID, provider);

//     // 5. Discover all poolState accounts
//     const pools = await program.account.poolState.all();

//     // 6. Return JSON
//     return new Response(
//       JSON.stringify({
//         programId: CP_SWAP_PROGRAM_ID.toBase58(),
//         network: "devnet",
//         count: pools.length,
//         pools: pools.map((p) => ({
//           poolState: p.publicKey.toBase58(),
//           mintA: p.account.mintA.toBase58(),
//           mintB: p.account.mintB.toBase58(),
//           vaultA: p.account.vaultA.toBase58(),
//           vaultB: p.account.vaultB.toBase58(),
//           reserveA: p.account.reserveA.toString(),
//           reserveB: p.account.reserveB.toString(),
//           feeRate: p.account.feeRate,
//         })),
//       }),
//       { headers: { "Content-Type": "application/json" } },
//     );
//   } catch (err: any) {
//     // 7. Proper error reporting
//     return new Response(
//       JSON.stringify({
//         error: err.message ?? String(err),
//       }),
//       { status: 500 },
//     );
//   }
// }
