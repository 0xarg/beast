import React from "react";
import Navbar from "../components/navbar";
import Container from "../components/container";

const page = () => {
  return (
    <div className="h-screen w-full">
      <Navbar />
      <Container>
        <h1 className="text-3xl font-medium">Transactions</h1>
        <div className="mx-auto flex items-center justify-center bg-red-400">
          <div className="rounded-xl bg-white p-6"></div>
        </div>
      </Container>
    </div>
  );
};

export default page;
