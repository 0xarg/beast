import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div>
      <div className="my-20 flex w-full flex-wrap items-center justify-center gap-20">
        <div className="flex flex-col gap-6">
          <h1 className="max-w-2xl text-5xl leading-normal font-bold tracking-wide">
            High‑Performance Dedicated Infrastructure
          </h1>
          <p className="mt-3 max-w-xl text-xl leading-loose font-semibold tracking-wide text-neutral-800">
            Ultra‑fast, low‑latency nodes designed for{" "}
            <span className="bg- rounded-full bg-[#FFCD9F] px-2 py-1">HFT</span>
            ,{" "}
            <span className="bg- rounded-full bg-[#E3B4FA] px-2 py-1">
              DeFi
            </span>{" "}
            strategies,
            <span className="bg- rounded-full bg-[#B4DCFA] px-2 py-1">
              leading-relaxed
            </span>{" "}
            analytics, and{" "}
            <span className="bg- rounded-full bg-[#E3B4FA] px-2 py-1">
              dApps
            </span>
          </p>
          <button className="w-fit cursor-pointer rounded-lg border-2 border-[#FF6928] bg-[#FF6928] px-4 py-4 text-xl font-semibold text-white transition duration-200 hover:border-transparent hover:bg-[#FF8540]">
            Contact Us
          </button>
        </div>
        <Image src={"/hero1.svg"} alt="hero2" height={450} width={450} />
      </div>
      <div className="mt-30 flex items-center justify-around">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text- text-8xl font-bold text-[#FF6928]">7+</h1>
          <p className="text-2xl font-bold text-neutral-800">
            Years on the market
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text- text-8xl font-bold text-[#FF6928]">$20M+</h1>
          <p className="text-2xl font-bold text-neutral-800">
            Saved in infrastructure costs
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text- text-8xl font-bold text-[#FF6928]">$10B+</h1>
          <p className="text-2xl font-bold text-neutral-800">
            Clients' market capitalization
          </p>
        </div>
      </div>
      <div className="mt-30 flex items-center justify-center">
        <h1 className="max-w-6xl text-center text-3xl leading-normal font-semibold tracking-wider">
          RPC Fast is the{" "}
          <span className="bg- rounded-xl bg-[#E3B4FA] px-2 py-1">
            {" "}
            #1 provider
          </span>{" "}
          for pro traders and dApps—offering{" "}
          <span className="bg- rounded-xl bg-[#FFCD9F] px-2 py-1">
            {" "}
            ultra‑low latency
          </span>
          , fast TXs landing,{" "}
          <span className="bg- rounded-xl bg-[#B4DCFA] px-2 py-1">
            {" "}
            no credit limits
          </span>
          , and expert{" "}
          <span className="bg- rounded-xl bg-[#E3B4FA] px-2 py-1">
            {" "}
            support
          </span>
          .
        </h1>
      </div>
    </div>
  );
};

export default Hero;
