"use client";

import { useEffect, useState, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// ============================================
// 🔧 CONFIGURATION - EDIT THESE VALUES
// ============================================
const CONFIG = {
  RPC_ENDPOINT: "https://solana-devnet.g.alchemy.com/v2/nsie4CkPWDSvgFDKT6Yhg",
  POOL_ID: "DFX6bzMzPMbxFCiGTh8t3AT9Zegu3mg6siyMG8k6zbGk",

  TOKEN_A: {
    mint: "CeCkcRKBzN9v4sU8pWyAfBKuqP3mAGh7KcPzL5hCvQe3",
    symbol: "SOL",
    decimals: 9,
  },

  TOKEN_B: {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "Sol",
    decimals: 9,
  },

  DEFAULT_SLIPPAGE: 0.01,
  CLUSTER: "devnet" as "mainnet" | "devnet",
};

// ============================================
// 📝 TYPES
// ============================================
interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  minOutputAmount: string;
  priceImpact: string;
  executionPrice: string;
  fee: string;
  rate: string;
}

interface TokenConfig {
  mint: string;
  symbol: string;
  decimals: number;
}

// ============================================
// 🎨 MAIN COMPONENT
// ============================================
export default function CpmmSwapInterface() {
  // Wallet connection
  const { publicKey, signAllTransactions, connected } = useWallet();
  const { connection } = useConnection();

  // State
  const [raydium, setRaydium] = useState<any>(null);
  const [poolData, setPoolData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [inputToken, setInputToken] = useState<TokenConfig>(CONFIG.TOKEN_A);
  const [outputToken, setOutputToken] = useState<TokenConfig>(CONFIG.TOKEN_B);
  const [inputAmount, setInputAmount] = useState("");

  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(CONFIG.DEFAULT_SLIPPAGE);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // ============================================
  // 🚀 INITIALIZE RAYDIUM
  // ============================================
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Initialize Raydium
        const raydiumInstance = await Raydium.load({
          connection,
          cluster: CONFIG.CLUSTER,
          owner: publicKey || undefined,
          signAllTransactions,
        });

        if (!mounted) return;

        setRaydium(raydiumInstance);
        setIsInitialized(true);
        setError(null);
        console.log("✅ Raydium SDK initialized");
      } catch (err: any) {
        if (!mounted) return;
        console.error("❌ Raydium initialization error:", err);
        setError(`Failed to initialize:  ${err.message}`);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [publicKey, signAllTransactions]);

  // ============================================
  // 📊 FETCH POOL DATA
  // ============================================
  useEffect(() => {
    if (!raydium || !isInitialized) return;

    let mounted = true;

    async function fetchPool() {
      try {
        console.log("📊 Fetching pool data.. .");
        const rpcData = await raydium.cpmm.getRpcPoolInfo(CONFIG.POOL_ID, true);

        if (!mounted) return;

        console.log("✅ Pool data fetched:", rpcData);
        setPoolData(rpcData);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error("❌ Pool fetch error:", err);
        setError(`Failed to fetch pool: ${err.message}`);
      }
    }

    fetchPool();

    return () => {
      mounted = false;
    };
  }, [raydium, isInitialized]);

  // ============================================
  // 💰 CALCULATE SWAP QUOTE
  // ============================================
  const calculateQuote = useCallback(
    async (amount: string) => {
      if (!amount || parseFloat(amount) <= 0 || !poolData || !raydium) {
        setQuote(null);
        return;
      }

      setIsCalculating(true);
      setError(null);

      try {
        const isBaseIn = inputToken.mint === CONFIG.TOKEN_A.mint;
        const inputAmountBN = new BN(
          new Decimal(amount).mul(10 ** inputToken.decimals).toFixed(0),
        );

        const computePool = {
          id: new PublicKey(CONFIG.POOL_ID),
          version: 7 as const,
          programId: poolData.programId,
          configInfo: poolData.configInfo,
          mintA: {
            address: CONFIG.TOKEN_A.mint,
            decimals: CONFIG.TOKEN_A.decimals,
            programId: poolData.mintProgramA.toString(),
          },
          mintB: {
            address: CONFIG.TOKEN_B.mint,
            decimals: CONFIG.TOKEN_B.decimals,
            programId: poolData.mintProgramB.toString(),
          },
          authority: poolData.authority || PublicKey.default,
          baseReserve: poolData.baseReserve,
          quoteReserve: poolData.quoteReserve,
          vaultAAmount: poolData.vaultAAmount,
          vaultBAmount: poolData.vaultBAmount,
          poolPrice: poolData.poolPrice,
          lpAmount: poolData.lpAmount,
          mintDecimalA: CONFIG.TOKEN_A.decimals,
          mintDecimalB: CONFIG.TOKEN_B.decimals,
          mintProgramA: poolData.mintProgramA,
          mintProgramB: poolData.mintProgramB,
          vaultA: poolData.vaultA,
          vaultB: poolData.vaultB,
          configId: poolData.configId,
          lpDecimals: poolData.lpDecimals,
          mintLp: poolData.mintLp,
          openTime: poolData.openTime,
          feeOn: poolData.feeOn || 0,
        };

        const result = raydium.cpmm.computeSwapAmount({
          pool: computePool,
          amountIn: inputAmountBN,
          outputMint: outputToken.mint,
          slippage: slippage,
          swapBaseIn: true,
        });

        const outputAmountFormatted = new Decimal(result.amountOut.toString())
          .div(10 ** outputToken.decimals)
          .toFixed(outputToken.decimals);

        const minOutputFormatted = new Decimal(result.minAmountOut.toString())
          .div(10 ** outputToken.decimals)
          .toFixed(outputToken.decimals);

        const feeFormatted = new Decimal(result.fee.toString())
          .div(10 ** inputToken.decimals)
          .toFixed(8);

        const priceImpactFormatted = new Decimal(result.priceImpact.toString())
          .mul(100)
          .toFixed(2);

        const executionPriceFormatted = result.executionPrice.toFixed(6);
        const rate = new Decimal(outputAmountFormatted).div(amount).toFixed(6);

        setQuote({
          inputAmount: amount,
          outputAmount: outputAmountFormatted,
          minOutputAmount: minOutputFormatted,
          priceImpact: priceImpactFormatted,
          executionPrice: executionPriceFormatted,
          fee: feeFormatted,
          rate: rate,
        });

        console.log("✅ Quote calculated:", {
          input: `${amount} ${inputToken.symbol}`,
          output: `${outputAmountFormatted} ${outputToken.symbol}`,
          rate: `1 ${inputToken.symbol} = ${rate} ${outputToken.symbol}`,
        });
      } catch (err: any) {
        console.error("❌ Quote calculation error:", err);
        setError(`Quote failed: ${err.message}`);
        setQuote(null);
      } finally {
        setIsCalculating(false);
      }
    },
    [poolData, raydium, inputToken, outputToken, slippage],
  );

  // ============================================
  // ⏱️ DEBOUNCED QUOTE CALCULATION
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateQuote(inputAmount);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputAmount, calculateQuote]);

  // ============================================
  // 🔄 REVERSE SWAP DIRECTION
  // ============================================
  const reverseDirection = useCallback(() => {
    const tempToken = inputToken;
    setInputToken(outputToken);
    setOutputToken(tempToken);

    if (quote && quote.outputAmount) {
      setInputAmount(quote.outputAmount);
    }

    console.log("🔄 Direction reversed");
  }, [inputToken, outputToken, quote]);

  // ============================================
  // 💸 EXECUTE SWAP
  // ============================================
  const executeSwap = useCallback(async () => {
    if (!connected || !publicKey || !raydium || !poolData || !quote) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSwapping(true);
    setError(null);
    setSuccessMessage(null);
    setTxSignature(null);

    try {
      console.log("🔄 Executing swap...");

      const isBaseIn = inputToken.mint === CONFIG.TOKEN_A.mint;
      const inputAmountBN = new BN(
        new Decimal(inputAmount).mul(10 ** inputToken.decimals).toFixed(0),
      );

      // Fetch pool info for swap
      const { poolInfo, poolKeys } = await raydium.cpmm.getPoolInfoFromRpc(
        CONFIG.POOL_ID,
      );

      console.log("Pool Info:", poolInfo);
      console.log("Pool Keys:", poolKeys);

      // Calculate swap result
      const rpcData = await raydium.cpmm.getRpcPoolInfo(CONFIG.POOL_ID, true);

      const swapResult = {
        inputAmount: inputAmountBN,
        outputAmount: new BN(
          new Decimal(quote.outputAmount)
            .mul(10 ** outputToken.decimals)
            .toFixed(0),
        ),
      };

      console.log("Swap params:", {
        baseIn: isBaseIn,
        inputAmount: inputAmountBN.toString(),
        outputAmount: swapResult.outputAmount.toString(),
        slippage,
      });

      // Execute swap
      const { execute } = await raydium.cpmm.swap({
        poolInfo: poolInfo,
        poolKeys: poolKeys,
        inputAmount: inputAmountBN,
        swapResult: swapResult,
        slippage: slippage,
        baseIn: isBaseIn,
        computeBudgetConfig: {
          units: 600000,
          microLamports: 100000,
        },
        txVersion: TxVersion.V0,
      });

      // Execute transaction
      const { txId } = await execute({ sendAndConfirm: true });

      console.log("✅ Swap successful!");
      console.log("Transaction ID:", txId);

      setSuccessMessage("Swap executed successfully!");
      setTxSignature(txId);
      setInputAmount("");
      setQuote(null);

      // Refresh pool data
      setTimeout(() => {
        raydium.cpmm.getRpcPoolInfo(CONFIG.POOL_ID, true).then(setPoolData);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Swap error:", err);
      setError(`Swap failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSwapping(false);
    }
  }, [
    connected,
    publicKey,
    raydium,
    poolData,
    quote,
    inputToken,
    outputToken,
    inputAmount,
    slippage,
  ]);

  // ============================================
  // 🎯 RENDER
  // ============================================

  if (!isInitialized) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Initializing Raydium SDK...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>🔄 CPMM Swap</h2>

          {/* Wallet Button */}
          <div style={styles.walletButtonContainer}>
            <WalletMultiButton style={styles.walletButton as any} />
          </div>

          <div style={styles.slippageContainer}>
            <label style={styles.slippageLabel}>
              Slippage: {(slippage * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={slippage * 100}
              onChange={(e) => setSlippage(parseFloat(e.target.value) / 100)}
              style={styles.slider}
            />
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✅</span>
            <div>
              <div style={styles.successTitle}>{successMessage}</div>
              {txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=${CONFIG.CLUSTER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.explorerLink}
                >
                  View on Explorer →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputHeader}>
            <label style={styles.label}>You Pay</label>
            <span style={styles.tokenBadge}>{inputToken.symbol}</span>
          </div>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0. 0"
            style={styles.input}
            disabled={!poolData || isSwapping}
          />
        </div>

        {/* Reverse Button */}
        <div style={styles.reverseButtonContainer}>
          <button
            onClick={reverseDirection}
            style={styles.reverseButton}
            disabled={!poolData || isSwapping}
          >
            <span style={styles.reverseIcon}>⇅</span>
          </button>
        </div>

        {/* Output Section */}
        <div style={styles.outputSection}>
          <div style={styles.inputHeader}>
            <label style={styles.label}>You Receive</label>
            <span style={styles.tokenBadge}>{outputToken.symbol}</span>
          </div>
          <div style={styles.outputValue}>
            {isCalculating ? (
              <div style={styles.calculatingText}>
                <div style={styles.miniSpinner}></div>
                Calculating...
              </div>
            ) : quote ? (
              <span style={styles.outputAmount}>{quote.outputAmount}</span>
            ) : (
              <span style={styles.placeholder}>0.0</span>
            )}
          </div>
        </div>

        {/* Quote Details */}
        {quote && !isCalculating && (
          <div style={styles.detailsContainer}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Rate</span>
              <span style={styles.detailValue}>
                1 {inputToken.symbol} = {quote.rate} {outputToken.symbol}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Minimum Received</span>
              <span style={styles.detailValue}>
                {quote.minOutputAmount} {outputToken.symbol}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Price Impact</span>
              <span
                style={{
                  ...styles.detailValue,
                  color:
                    parseFloat(quote.priceImpact) > 1
                      ? "#ef4444"
                      : parseFloat(quote.priceImpact) > 0.5
                        ? "#f59e0b"
                        : "#10b981",
                  fontWeight: "bold",
                }}
              >
                {quote.priceImpact}%{parseFloat(quote.priceImpact) > 1 && " ⚠️"}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Trading Fee</span>
              <span style={styles.detailValue}>
                {quote.fee} {inputToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Pool Info */}
        {poolData && (
          <div style={styles.poolInfo}>
            <div style={styles.poolInfoTitle}>📊 Pool Information</div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Pool Price</span>
              <span style={styles.detailValue}>
                {poolData.poolPrice.toFixed(6)}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Reserve A</span>
              <span style={styles.detailValue}>
                {new Decimal(poolData.baseReserve.toString())
                  .div(10 ** CONFIG.TOKEN_A.decimals)
                  .toFixed(2)}{" "}
                {CONFIG.TOKEN_A.symbol}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Reserve B</span>
              <span style={styles.detailValue}>
                {new Decimal(poolData.quoteReserve.toString())
                  .div(10 ** CONFIG.TOKEN_B.decimals)
                  .toFixed(2)}{" "}
                {CONFIG.TOKEN_B.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          style={{
            ...styles.swapButton,
            ...((!quote ||
              isCalculating ||
              !poolData ||
              !connected ||
              isSwapping) &&
              styles.swapButtonDisabled),
          }}
          disabled={
            !quote || isCalculating || !poolData || !connected || isSwapping
          }
        >
          {isSwapping ? (
            <>
              <div style={styles.buttonSpinner}></div>
              Swapping...
            </>
          ) : !connected ? (
            "Connect Wallet"
          ) : isCalculating ? (
            "Calculating..."
          ) : !poolData ? (
            "Loading Pool..."
          ) : !quote ? (
            "Enter Amount"
          ) : (
            "🚀 Execute Swap"
          )}
        </button>

        {/* Footer Info */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {connected
              ? `Connected:  ${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`
              : "💡 Connect your wallet to execute swaps"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🎨 STYLES
// ============================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "32px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "16px",
    margin: 0,
    textAlign: "center",
  },
  walletButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  walletButton: {
    borderRadius: "12px ! important",
  },
  slippageContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  },
  slippageLabel: {
    fontSize: "14px",
    color: "#6b7280",
    minWidth: "100px",
  },
  slider: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    outline: "none",
    cursor: "pointer",
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #86efac",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  successIcon: {
    fontSize: "24px",
  },
  successTitle: {
    fontWeight: "bold",
    color: "#166534",
    marginBottom: "8px",
  },
  explorerLink: {
    color: "#059669",
    fontSize: "14px",
    textDecoration: "underline",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#991b1b",
    fontSize: "14px",
  },
  errorIcon: {
    fontSize: "20px",
  },
  inputSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "12px",
  },
  inputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
  },
  tokenBadge: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    fontSize: "32px",
    fontWeight: "bold",
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    color: "#1f2937",
  },
  reverseButtonContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "12px 0",
  },
  reverseButton: {
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "24px",
  },
  reverseIcon: {
    display: "block",
  },
  outputSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
  },
  outputValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
  },
  outputAmount: {
    color: "#667eea",
  },
  placeholder: {
    color: "#d1d5db",
  },
  calculatingText: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "18px",
    color: "#9ca3af",
  },
  miniSpinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  detailsContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  detailLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  poolInfo: {
    backgroundColor: "#eff6ff",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
  },
  poolInfoTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: "12px",
  },
  swapButton: {
    width: "100%",
    backgroundColor: "#667eea",
    color: "white",
    padding: "18px",
    borderRadius: "16px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  swapButtonDisabled: {
    backgroundColor: "#d1d5db",
    cursor: "not-allowed",
  },
  buttonSpinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  footer: {
    textAlign: "center",
    padding: "16px 0",
  },
  footerText: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "20px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #f3f4f6",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
