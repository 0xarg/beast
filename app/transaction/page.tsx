"use client";
import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Container from "../components/container";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import ConnectWallet from "../components/connectWallet";
import { toast } from "sonner";
import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type UserTransactions = ConfirmedSignatureInfo;

const page = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [transactions, setTransactions] = useState<UserTransactions[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!wallet.publicKey) {
      toast("Public Key not found");
      return;
    }
    const txns = await connection.getSignaturesForAddress(wallet.publicKey);
    setTransactions(txns);
    toast("Fetched transactions");
  }, [toast, connection, wallet, setTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!wallet || !wallet.publicKey) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-screen w-full bg-[#FDF2EC]">
      <Navbar />
      <Container>
        <h1 className="text-3xl font-medium">Transactions</h1>
        <div className="mx-auto mt-13 flex flex-col items-center justify-center gap-5">
          {transactions.map((txn, index) => (
            <div
              key={index}
              className="flex w-full justify-between rounded-xl border-2 bg-white p-6"
            >
              <div className="flex flex-col items-start justify-center gap-2">
                <div className="space-3 flex">
                  <span>
                    {txn.err ? (
                      <Badge variant={"destructive"} className="font-bold">
                        Failed
                      </Badge>
                    ) : (
                      <Badge
                        variant={"default"}
                        className="bg-green-300 font-bold text-black"
                      >
                        Success
                      </Badge>
                    )}
                    {txn.blockTime && (
                      <Badge>
                        {new Date(txn.blockTime * 1000).toDateString()}
                      </Badge>
                    )}
                  </span>
                </div>
                <span className="flex items-center justify-center font-semibold">
                  <p>{txn.signature.slice(0, 5)}</p>
                  <p className="">....</p>
                  <p>{txn.signature.slice(7, 12)}</p>
                </span>
              </div>
              <div>
                <Button>View details</Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default page;
