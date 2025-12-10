"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import ConnectWallet from "../components/connectWallet";
import Navbar from "../components/navbar";

const page = () => {
  const connection = useConnection();
  const wallet = useWallet();
  if (!wallet.connected) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-full w-full">
      <Navbar />
    </div>
  );
};

export default page;
