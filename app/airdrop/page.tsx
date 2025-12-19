"use client";
import { Container } from "lucide-react";
import React from "react";
import Navbar from "../components/navbar";
import ConnectWallet from "../components/connectWallet";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const page = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  if (!wallet.connected) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-screen w-full bg-[#FDF2EC]">
      <Container>
        <Navbar />
        {/* <div className="mt-20 h-full flex-col flex-wrap items-center justify-center overflow-hidden px-5 md:flex-nowrap">
          <div className="leading-loose">
            <h1 className="text-4xl font-semibold tracking-wide text-neutral-800">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500">
              Manage your wallet and view your assets
            </p>
          </div>
        </div> */}
      </Container>
    </div>
  );
};

export default page;
