"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Raydium,
  DEVNET_PROGRAM_ID,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import { BN } from "@project-serum/anchor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import ConnectWallet from "../components/connectWallet";

interface PoolInfo {
  poolId: string;
  lpMint: string;
  vaultA: string;
  vaultB: string;
  txId: string;
  reserveA?: string;
  reserveB?: string;
}

export default function Page() {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();

  const [status, setStatus] = useState("");
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [raydium, setRaydium] = useState<Raydium | null>(null);
  const [loading, setLoading] = useState(false);

  // Token mints
  const baseMint = new PublicKey(
    "CeCkcRKBzN9v4sU8pWyAfBKuqP3mAGh7KcPzL5hCvQe3",
  );
  const quoteMint = new PublicKey(
    "4UePPL5M7bMmFzH89Pjq3Zd1RKbrRGJSMJGhMyaFYuei",
  );

  // Initialize Raydium
  useEffect(() => {
    if (!publicKey || !signAllTransactions || raydium) return;

    (async () => {
      try {
        const sdk = await Raydium.load({
          connection,
          owner: publicKey,
          signAllTransactions,
          cluster: "devnet",
          disableFeatureCheck: true,
          disableLoadToken: false,
          blockhashCommitment: "finalized",
        });
        setRaydium(sdk);
      } catch (error) {
        console.error("Failed to init Raydium:", error);
      }
    })();
  }, [publicKey, signAllTransactions, connection, raydium]);

  // Fetch pool reserves
  const fetchPoolReserves = useCallback(
    async (poolId: string, vaultA: string, vaultB: string) => {
      try {
        const vaultABalance = await connection.getTokenAccountBalance(
          new PublicKey(vaultA),
        );
        const vaultBBalance = await connection.getTokenAccountBalance(
          new PublicKey(vaultB),
        );

        return {
          reserveA: vaultABalance.value.uiAmountString || "0",
          reserveB: vaultBBalance.value.uiAmountString || "0",
        };
      } catch (error) {
        console.error("Error fetching reserves:", error);
        return {
          reserveA: "0",
          reserveB: "0",
        };
      }
    },
    [connection],
  );

  // Refresh pool info
  const refreshPoolInfo = useCallback(async () => {
    if (!poolInfo) return;

    setLoading(true);
    try {
      const reserves = await fetchPoolReserves(
        poolInfo.poolId,
        poolInfo.vaultA,
        poolInfo.vaultB,
      );
      setPoolInfo({
        ...poolInfo,
        ...reserves,
      });
    } catch (error) {
      console.error("Error refreshing pool:", error);
    } finally {
      setLoading(false);
    }
  }, [poolInfo, fetchPoolReserves]);

  // Create pool
  const createPool = useCallback(async () => {
    if (!publicKey || !signAllTransactions) {
      alert("Connect wallet first");
      return;
    }

    try {
      setLoading(true);
      setStatus("Initializing Raydium...");

      const raydiumInstance =
        raydium ||
        (await Raydium.load({
          connection,
          owner: publicKey,
          signAllTransactions,
          cluster: "devnet",
          disableFeatureCheck: true,
          disableLoadToken: false,
          blockhashCommitment: "finalized",
        }));

      if (!raydium) setRaydium(raydiumInstance);

      setStatus("Getting CPMM fee config...");

      let cpmmConfigs;
      try {
        cpmmConfigs = await raydiumInstance.api.getCpmmConfigs();
      } catch (error) {
        console.log("Using fallback fee config for devnet");
        cpmmConfigs = [
          {
            id: "default-config",
            index: 0,
            tradeFeeRate: 2500,
            protocolFeeRate: 12000,
            fundFeeRate: 40000,
            createPoolFee: "0",
          },
        ];
      }

      if (!cpmmConfigs || cpmmConfigs.length === 0) {
        throw new Error("No CPMM fee configs available");
      }

      const feeConfig = cpmmConfigs[0];

      setStatus("Creating CPMM pool...");

      const { execute, extInfo } = await raydiumInstance.cpmm.createPool({
        programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
        poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,

        mintA: {
          address: baseMint.toString(),
          decimals: 9,
          programId: TOKEN_2022_PROGRAM_ID.toString(),
        },

        mintB: {
          address: quoteMint.toString(),
          decimals: 9,
          programId: TOKEN_2022_PROGRAM_ID.toString(),
        },

        mintAAmount: new BN(1000 * 10 ** 9),
        mintBAmount: new BN(100 * 10 ** 9),

        startTime: new BN(Math.floor(Date.now() / 1000)),

        ownerInfo: {
          useSOLBalance: false,
        },

        feeConfig: {
          id: feeConfig.id,
          tradeFeeRate: feeConfig.tradeFeeRate,
          protocolFeeRate: feeConfig.protocolFeeRate,
          fundFeeRate: feeConfig.fundFeeRate,
          createPoolFee: feeConfig.createPoolFee || "0",
          index: 0,
          creatorFeeRate: 0,
        },

        associatedOnly: false,
        checkCreateATAOwner: true,
        txVersion: TxVersion.V0,

        computeBudgetConfig: {
          units: 600000,
          microLamports: 100000,
        },
      });

      setStatus("Executing transaction...");
      const { txId } = await execute();

      console.log("✅ Pool created successfully!");
      console.log("Transaction:", txId);
      console.log("Pool ID:", extInfo.address?.poolId?.toString());

      const poolId = extInfo.address?.poolId?.toString() || "";
      const vaultA = extInfo.address?.vaultA?.toString() || "";
      const vaultB = extInfo.address?.vaultB?.toString() || "";

      // Fetch initial reserves
      const reserves = await fetchPoolReserves(poolId, vaultA, vaultB);

      // Set pool info
      const newPoolInfo: PoolInfo = {
        poolId,
        lpMint: extInfo.address?.lpMint?.toString() || "",
        vaultA,
        vaultB,
        txId,
        ...reserves,
      };

      setPoolInfo(newPoolInfo);
      setStatus("✅ Pool created successfully!");
    } catch (error: any) {
      console.error("❌ Error creating pool:", error);
      setStatus(`❌ Error: ${error.message || error}`);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  }, [
    publicKey,
    signAllTransactions,
    connection,
    raydium,
    baseMint,
    quoteMint,
    fetchPoolReserves,
  ]);

  if (!publicKey) {
    return <ConnectWallet />;
  }

  // Show pool UI after creation
  if (poolInfo) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🎉 Pool Created! </h1>
          <WalletMultiButton />
        </div>

        {/* Pool Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pool Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPoolInfo}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Pool ID */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Pool ID
                </p>
                <p className="mb-2 font-mono text-xs break-all">
                  {poolInfo.poolId}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() =>
                    window.open(
                      `https://explorer.solana.com/address/${poolInfo.poolId}? cluster=devnet`,
                      "_blank",
                    )
                  }
                >
                  View on Explorer →
                </Button>
              </div>

              {/* Transaction */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Creation Transaction
                </p>
                <p className="mb-2 font-mono text-xs break-all">
                  {poolInfo.txId.slice(0, 16)}...{poolInfo.txId.slice(-16)}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() =>
                    window.open(
                      `https://explorer.solana.com/tx/${poolInfo.txId}?cluster=devnet`,
                      "_blank",
                    )
                  }
                >
                  View Transaction →
                </Button>
              </div>

              {/* LP Token */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  LP Token Mint
                </p>
                <p className="font-mono text-xs break-all">{poolInfo.lpMint}</p>
              </div>

              {/* Pool Type */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Pool Type
                </p>
                <p className="text-lg font-semibold">CPMM</p>
                <p className="text-xs text-gray-500">Token-2022 Compatible</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liquidity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pool Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Token A Reserve */}
              <div className="rounded-lg bg-blue-50 p-6">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Token A Reserve
                </p>
                <p className="text-3xl font-bold">
                  {poolInfo.reserveA || "1,000"}
                </p>
                <p className="mt-2 font-mono text-xs text-gray-500">
                  {baseMint.toString().slice(0, 16)}...
                </p>
              </div>

              {/* Token B Reserve */}
              <div className="rounded-lg bg-green-50 p-6">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Token B Reserve
                </p>
                <p className="text-3xl font-bold">
                  {poolInfo.reserveB || "100"}
                </p>
                <p className="mt-2 font-mono text-xs text-gray-500">
                  {quoteMint.toString().slice(0, 16)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {status && (
          <Card>
            <CardContent className="pt-6">
              <div className="rounded bg-gray-50 p-4">
                <p className="text-sm whitespace-pre-wrap">{status}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setPoolInfo(null);
              setStatus("");
            }}
            className="flex-1"
          >
            Create Another Pool
          </Button>
          <Button
            onClick={() =>
              window.open(
                `https://explorer.solana.com/address/${poolInfo.poolId}?cluster=devnet`,
                "_blank",
              )
            }
            className="flex-1"
          >
            View Pool on Explorer
          </Button>
        </div>
      </div>
    );
  }

  // Show pool creation form
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create CPMM Pool</h1>
        <WalletMultiButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Token */}
          <div className="rounded-lg border bg-blue-50 p-4">
            <p className="mb-2 text-sm font-medium">Base Token (Token A)</p>
            <p className="mb-2 font-mono text-xs text-gray-600">
              {baseMint.toString()}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Amount:</span>
              <span>1,000 tokens</span>
            </div>
          </div>

          {/* Quote Token */}
          <div className="rounded-lg border bg-green-50 p-4">
            <p className="mb-2 text-sm font-medium">Quote Token (Token B)</p>
            <p className="mb-2 font-mono text-xs text-gray-600">
              {quoteMint.toString()}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Amount:</span>
              <span>100 tokens</span>
            </div>
          </div>

          {/* Pool Type Info */}
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">ℹ️</div>
              <div>
                <p className="mb-1 font-medium">Pool Type: CPMM</p>
                <p className="text-sm text-gray-600">
                  Constant Product Market Maker • Token-2022 Compatible
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={createPool}
        disabled={!publicKey || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Creating Pool..." : "Create Pool"}
      </Button>

      {status && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded bg-gray-50 p-4">
              <p className="font-mono text-sm whitespace-pre-wrap">{status}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
