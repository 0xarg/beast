"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import ConnectWallet from "../components/connectWallet";
import Navbar from "../components/navbar";
import Container from "../components/container";

const page = () => {
  const connection = useConnection();
  const wallet = useWallet();
  if (!wallet.connected) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-screen w-full bg-[#FDF2EC]">
      <Container>
        <Navbar />
      </Container>
    </div>
  );
};

export default page;
