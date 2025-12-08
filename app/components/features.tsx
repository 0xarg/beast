import React from "react";

const Features = () => {
  return (
    <div className="mt-20 flex flex-col flex-wrap items-center justify-center">
      <h1 className="text-center text-xl font-bold text-neutral-800 md:text-3xl">
        RPC Fast vs Traditional blockchain APIs
      </h1>
      <div className="flex w-full flex-wrap items-center justify-center gap-10">
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#E3B4FA] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#E3B4FA] px-2 py-3 text-center text-2xl font-semibold tracking-wide">
            Best-in-Market Latency
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Direct node access ensures your requests work faster than any shared
            API
          </p>
        </div>
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#FFCD9F] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#FFCD9F] px-2 py-3 text-center text-2xl font-semibold tracking-wide">
            Tailored to Your Needs
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Select stack components, versions, and plugins that work best for
            you
          </p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-10">
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#B4DCFA] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#B4DCFA] px-2 py-3 text-center text-2xl font-semibold">
            Blink‑Fast TXs Landing
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Capture every arbitrage — 83% of your transactions hit first vs.
            shared RPCs
          </p>
        </div>
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#222222] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#222222] px-2 py-3 text-center text-2xl font-semibold tracking-wider text-white">
            We Handle Everything
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Continuous expert support and rapid incident solving — guaranteed
          </p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-10">
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#FFCD9F] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#FFCD9F] px-2 py-3 text-center text-2xl font-semibold">
            99,9% uptime globally
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Enterprise‑grade uptime and seamless performance across US, EU, and
            Asia
          </p>
        </div>
        <div className="mt-6 flex max-w-lg flex-wrap items-center justify-center gap-5 rounded-3xl border-3 border-b-6 border-[#E3B4FA] bg-white px-10 py-10 md:flex-nowrap">
          <h2 className="inline-block rounded-2xl bg-[#E3B4FA] px-2 py-3 text-center text-2xl font-semibold">
            Up to 5× Cost Reduction
          </h2>
          <p className="max-w-xl text-lg font-semibold tracking-tight text-neutral-700">
            Battle-tested solutions ensure the lowest costs at any load
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
