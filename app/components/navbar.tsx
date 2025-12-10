"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Sidebar } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const links = [
    {
      title: `Fintech Infra`,
      link: "/",
    },
    {
      title: `Dedicated Cluster`,
      link: "/",
    },
    {
      title: `Resources`,
      link: "/",
    },
  ];

  const connection = useConnection();
  const wallet = useWallet();
  return (
    <div className="mt-3 flex flex-wrap items-center justify-around sm:gap-5">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">BEAST</h1>
      </div>
      <div className="hidden items-center gap-5 font-medium text-neutral-800 sm:gap-5 lg:flex">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.link}
            className="rounded-lg border-2 border-transparent px-2 py-3 hover:border-[#FFCD9F] hover:bg-white"
          >
            {link.title}
          </Link>
        ))}
      </div>
      <div className="hidden items-center gap-3 md:flex">
        {/* <button className="cursor-pointer rounded-lg border-2 border-[#FF6928] bg-[#FF6928] px-3 py-3 font-semibold text-white transition duration-200 hover:border-transparent hover:bg-[#FF8540]"> */}
        {!wallet.connected && <WalletMultiButton />}
        {wallet.connected && (
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer rounded-lg border-2 border-[#FF6928] px-3 py-3 font-semibold text-neutral-900 transition duration-200 hover:border-transparent hover:bg-[#FF8540] hover:text-white"
            >
              Dashboard
            </button>
            <WalletDisconnectButton />
          </div>
        )}
      </div>
      <div className="lg:hidden">
        <Sidebar />
      </div>
    </div>
  );
};

export default Navbar;
