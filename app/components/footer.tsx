import React from "react";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-5 font-medium text-neutral-100">
        <h1 className="text-xl font-semibold tracking-wide">BEAST</h1>
        <h2 className="text-xl font-semibold tracking-wide">
          Available Blockchains
        </h2>
        <div className="flex flex-wrap gap-14 bg-red-300 text-start">
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-xl font-semibold tracking-wide">
              Resources
            </h2>
            <p className="text-lg font-medium tracking-wide">Resources</p>
            <p className="text-lg font-medium tracking-wide">Resources</p>
          </div>
          <h2 className="text-xl font-semibold tracking-wide">Company</h2>
        </div>
      </div>
    </div>
  );
};

export default Footer;
