import React from "react";
import Container from "./components/container";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";

const Home = () => {
  return (
    <div className="font-display h-full w-full bg-[#FDF2EC]">
      <Container>
        <Navbar />
        <Hero />
        <Container className="bg-red-900 text-4xl">
          <Features />
        </Container>
      </Container>
    </div>
  );
};

export default Home;
