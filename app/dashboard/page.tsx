"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useCallback, useEffect, useState } from "react";
import ConnectWallet from "../components/connectWallet";
import Navbar from "../components/navbar";
import Container from "../components/container";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  ChartBarBig,
  Copy,
  ExternalLinkIcon,
  Gift,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import Link from "next/link";
import CustomSpinner from "../components/CustomSpinner";

const page = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<number>();
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [loader, setLoader] = useState<boolean>(false);

  const fetchBalance = useCallback(async () => {
    setLoader(true);
    if (!wallet.publicKey) {
      setBalance(0);
      return;
    }
    try {
      const lamports = await connection.getBalance(wallet.publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      setLoader(false);
    } catch (error) {
      console.log("Failed to fetch the balance");
      return;
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const fetchNetworkName = useCallback(async () => {
    // try {
    //   const genesisHash = await connection.getGenesisHash();
    //   switch (genesisHash) {
    //     case "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d":
    //       setNetworkName("Mainnet Beta");
    //       break;
    //     case "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkr96":
    //       setNetworkName("Devnet");
    //       break;
    //     case "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY":
    //       setNetworkName("Testnet");
    //       break;

    //     default:
    //       setNetworkName("Localnet/Custom");
    //   }
    // } catch (error) {
    //   console.log(error);
    //   setNetworkName("Unknown");
    // }
    if (connection.rpcEndpoint.includes("devnet")) {
      setNetworkName("Devnet");
    } else if (connection.rpcEndpoint.includes("mainnet")) {
      setNetworkName("Mainnet Beta");
    } else {
      setNetworkName("Custom/Localnet");
    }
  }, [connection]);

  useEffect(() => {
    fetchNetworkName();
  }, []);
  if (!wallet.connected) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-screen w-full bg-[#FDF2EC]">
      <Container>
        <Navbar />
        <div className="mt-20 h-full flex-col flex-wrap items-center justify-center overflow-hidden px-5 md:flex-nowrap">
          <div className="leading-loose">
            <h1 className="text-4xl font-semibold tracking-wide text-neutral-800">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500">
              Manage your wallet and view your assets
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-10 md:flex-nowrap">
            <div className="w-full rounded-2xl border-2 border-[#FDBA74] bg-white px-8 py-8">
              <div className="flex items-center justify-between">
                <h3 className="rounded-xl bg-[#FED7AA] px-3 py-2 font-semibold text-[#7C2D12]">
                  Wallets Address
                </h3>
                <Copy
                  className="rounedd-2xl cursor-pointer px-2 py-2 transition duration-200 hover:bg-[#F9FAFB]"
                  size={35}
                  onClick={() => {
                    copy(wallet.publicKey?.toString() ?? "no Wallet Key");
                    toast("Public key copieded to clipboard");
                  }}
                />
              </div>
              <p className="md:text-md mt-5 w-full overflow-hidden rounded-xl bg-[#F9FAFB] px-4 py-4 text-sm">
                {wallet.publicKey?.toString() ?? "Not connected"}
              </p>
              <Link
                href={`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`}
                target="blank"
                className="mt-4 flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#FA7315]"
              >
                <p>View in Explorer</p>
                <ExternalLinkIcon size={17} />
              </Link>
            </div>
            <div className="w-full rounded-2xl border-2 border-[#93C5FD] bg-white px-8 py-8">
              <div className="flex flex-wrap items-center justify-between">
                <h3 className="rounded-xl bg-[#C0DBFE] px-3 py-2 font-semibold text-[#1F3A8A]">
                  Balance
                </h3>
                <RefreshCcw
                  className="rounedd-2xl cursor-pointer px-2 py-2 transition duration-200 hover:bg-[#F9FAFB]"
                  size={35}
                  onClick={() => {
                    fetchBalance();
                    toast("Refreshed");
                  }}
                />
              </div>
              {!loader && (
                <p className="mt-3 px-1 py-1 text-4xl font-bold">{balance}</p>
              )}
              {loader && <CustomSpinner />}
              <p className="text-md px-4 py-4 text-neutral-600">
                Solana Devnet
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-between gap-10">
            <div className="w-full rounded-2xl border-2 border-[#D7B5FE] bg-white px-8 py-8">
              <div className="flex items-center justify-between">
                <h3 className="rounded-xl bg-[#E9D5FF] px-3 py-2 font-semibold text-[#581C87]">
                  <Wallet />
                </h3>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-semibold">Wallet Info</h3>
              </div>
              <div className="mt-2 flex flex-wrap justify-between md:flex-nowrap">
                <p className="font-semibold text-neutral-700">Network:</p>
                <p className="font-semibold text-neutral-600">{networkName}</p>
              </div>
              <div className="mt-2 flex flex-wrap justify-between md:flex-nowrap">
                <p className="font-semibold text-neutral-700">Status:</p>
                {wallet.connected ? (
                  <p className="font-semibold text-green-600">Connected</p>
                ) : (
                  <p>Disconnected</p>
                )}
              </div>
            </div>
            <div className="w-full rounded-2xl border-2 border-[#FDBA74] bg-white px-8 py-8">
              <div className="flex items-center justify-between">
                <h3 className="rounded-xl bg-[#FED7AA] px-3 py-2 font-semibold text-[#581C87]">
                  <Gift />
                </h3>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-semibold">Need Tokens?</h3>
                <p className="tracking-wide text-neutral-500">
                  Get testnet SOL for development
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-between md:flex-nowrap">
                <button className="text-md w-fit cursor-pointer rounded-lg border-2 border-[#FF6928] bg-[#FF6928] px-2 py-2 font-semibold text-white transition duration-200 hover:border-transparent hover:bg-[#FF8540]">
                  Contact Us
                </button>
              </div>
            </div>
            <div className="w-full rounded-2xl border-2 border-[#93C5FD] bg-white px-8 py-8">
              <div className="flex items-center justify-between">
                <h3 className="rounded-xl bg-[#C0DBFE] px-3 py-2 font-semibold text-[#581C87]">
                  <ChartBarBig />
                </h3>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-semibold">Wallet Info</h3>
              </div>
              <div className="mt-2 flex flex-col flex-wrap justify-between gap-2 md:flex-nowrap">
                <Link href={"/"} className="font-semibold text-[#3B82F6]">
                  View Transactions &rarr;
                </Link>
                <Link href={"/"} className="font-semibold text-[#3B82F6]">
                  Swap Tokens &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default page;
