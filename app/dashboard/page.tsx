"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React from "react";

const page = () => {
  const connection = useConnection();
  const wallet = useWallet();
  if (!wallet.connected) {
    return <div>Wallet Not Connected</div>;
  }
  return <div>Dashboard</div>;
};

export default page;
