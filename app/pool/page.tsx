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
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import ConnectWallet from "../components/connectWallet";

interface PoolInfo {
  poolId: string;
  lpMint: string;
  vaultA: string;
  vaultB: string;
  txId: string;
  reserveA?: string;
  reserveB?: string;
  initialAmountA: string;
  initialAmountB: string;
}

export default function Page() {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();

  const [status, setStatus] = useState("");
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [raydium, setRaydium] = useState<Raydium | null>(null);
  const [loading, setLoading] = useState(false);

  // User adjustable amounts
  const [baseAmount, setBaseAmount] = useState("2"); // Match user's balance
  const [quoteAmount, setQuoteAmount] = useState("3"); // Match user's balance

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

  // Check token balances
  const checkBalances = useCallback(async () => {
    if (!publicKey) return;

    try {
      setStatus("Checking token balances...");

      // Check base token
      const baseATA = await getAssociatedTokenAddress(
        baseMint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      const baseBalance = await connection.getTokenAccountBalance(baseATA);
      console.log("Base token balance:", baseBalance.value.uiAmount);

      // Check quote token
      const quoteATA = await getAssociatedTokenAddress(
        quoteMint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      const quoteBalance = await connection.getTokenAccountBalance(quoteATA);
      console.log("Quote token balance:", quoteBalance.value.uiAmount);

      setStatus(
        `✅ Balances:\nBase: ${baseBalance.value.uiAmount || 0}\nQuote: ${quoteBalance.value.uiAmount || 0}`,
      );

      return {
        base: baseBalance.value.uiAmount || 0,
        quote: quoteBalance.value.uiAmount || 0,
      };
    } catch (error) {
      console.error("Error checking balances:", error);
      setStatus(
        "❌ Error checking balances.  Make sure you have token accounts.",
      );
      return null;
    }
  }, [publicKey, connection, baseMint, quoteMint]);

  // Fetch pool reserves with retry
  const fetchPoolReserves = useCallback(
    async (
      vaultA: string,
      vaultB: string,
      retries = 3,
    ): Promise<{ reserveA: string; reserveB: string }> => {
      for (let i = 0; i < retries; i++) {
        try {
          // Wait a bit for vaults to be initialized
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

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
          console.log(`Attempt ${i + 1} failed, retrying...`);
          if (i === retries - 1) {
            console.error("Error fetching reserves after all retries:", error);
            return {
              reserveA: "Loading...",
              reserveB: "Loading...",
            };
          }
        }
      }

      return {
        reserveA: "Error",
        reserveB: "Error",
      };
    },
    [connection],
  );

  // Refresh pool info
  const refreshPoolInfo = useCallback(async () => {
    if (!poolInfo) return;

    setLoading(true);
    try {
      const reserves = await fetchPoolReserves(
        poolInfo.vaultA,
        poolInfo.vaultB,
        1,
      );
      setPoolInfo({
        ...poolInfo,
        ...reserves,
      });
      setStatus("✅ Pool info refreshed");
    } catch (error) {
      console.error("Error refreshing pool:", error);
      setStatus("❌ Error refreshing pool info");
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

    // Validate amounts
    const baseAmountNum = parseFloat(baseAmount);
    const quoteAmountNum = parseFloat(quoteAmount);

    if (isNaN(baseAmountNum) || baseAmountNum <= 0) {
      alert("Please enter a valid base amount");
      return;
    }

    if (isNaN(quoteAmountNum) || quoteAmountNum <= 0) {
      alert("Please enter a valid quote amount");
      return;
    }

    try {
      setLoading(true);

      // Check balances first
      const balances = await checkBalances();
      if (!balances) {
        alert("Failed to check balances. Make sure you have token accounts.");
        setLoading(false);
        return;
      }

      if (balances.base < baseAmountNum) {
        alert(
          `Insufficient base tokens.  You have ${balances.base}, need ${baseAmountNum}`,
        );
        setLoading(false);
        return;
      }

      if (balances.quote < quoteAmountNum) {
        alert(
          `Insufficient quote tokens. You have ${balances.quote}, need ${quoteAmountNum}`,
        );
        setLoading(false);
        return;
      }

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

      // Convert to smallest units (with 9 decimals)
      const mintAAmount = new BN(Math.floor(baseAmountNum * 10 ** 9));
      const mintBAmount = new BN(Math.floor(quoteAmountNum * 10 ** 9));

      console.log("Creating pool with amounts:", {
        baseAmount: baseAmountNum,
        quoteAmount: quoteAmountNum,
        mintAAmount: mintAAmount.toString(),
        mintBAmount: mintBAmount.toString(),
      });

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

        mintAAmount,
        mintBAmount,

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

      const poolId = extInfo.address?.poolId?.toString() || "";
      const vaultA = extInfo.address?.vaultA?.toString() || "";
      const vaultB = extInfo.address?.vaultB?.toString() || "";

      setStatus("Waiting for pool to initialize...");

      // Wait a bit before fetching reserves
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Fetch reserves with retry
      const reserves = await fetchPoolReserves(vaultA, vaultB, 5);

      // Set pool info
      const newPoolInfo: PoolInfo = {
        poolId,
        lpMint: extInfo.address?.lpMint?.toString() || "",
        vaultA,
        vaultB,
        txId,
        initialAmountA: baseAmount,
        initialAmountB: quoteAmount,
        ...reserves,
      };

      setPoolInfo(newPoolInfo);
      setStatus("✅ Pool created successfully!");
    } catch (error: any) {
      console.error("❌ Error creating pool:", error);
      setStatus(`❌ Error:  ${error.message || error}`);
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
    baseAmount,
    quoteAmount,
    checkBalances,
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

        {/* Success Alert */}
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <p className="font-semibold text-green-900">
                  Your CPMM pool has been created successfully!
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Initial liquidity: {poolInfo.initialAmountA} Token A +{" "}
                  {poolInfo.initialAmountB} Token B
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      `https://explorer.solana.com/address/${poolInfo.poolId}?cluster=devnet`,
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
                  {poolInfo.reserveA || poolInfo.initialAmountA}
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
                  {poolInfo.reserveB || poolInfo.initialAmountB}
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

      {/* Balance Checker */}
      <Card>
        <CardHeader>
          <CardTitle>Check Your Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkBalances} disabled={loading} className="w-full">
            Check Token Balances
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pool Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Token */}
          <div className="rounded-lg border bg-blue-50 p-4">
            <p className="mb-2 text-sm font-medium">Base Token (Token A)</p>
            <p className="mb-3 font-mono text-xs text-gray-600">
              {baseMint.toString()}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Amount:</label>
              <Input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.1"
                min="0"
                className="max-w-[200px]"
              />
            </div>
          </div>

          {/* Quote Token */}
          <div className="rounded-lg border bg-green-50 p-4">
            <p className="mb-2 text-sm font-medium">Quote Token (Token B)</p>
            <p className="mb-3 font-mono text-xs text-gray-600">
              {quoteMint.toString()}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Amount: </label>
              <Input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.1"
                min="0"
                className="max-w-[200px]"
              />
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
                <p className="mt-2 text-xs text-gray-500">
                  💡 Tip: Start with small amounts for testing
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
