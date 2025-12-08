import React from "react";
import Container from "./components/container";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import Features2 from "./components/features2";

const Home = () => {
  return (
    <>
      <div className="font-display h-full w-full bg-[#FDF2EC]">
        <Container>
          <Navbar />
          <Hero />
        </Container>
      </div>
      <div className="font-display h-full w-full bg-[#F8F3FF]">
        <Container>
          <Features />
        </Container>
      </div>
      <div className="font-display h-full w-full bg-[#FDF2EC]">
        <Container className="">
          <Features2 />
        </Container>
      </div>
    </>
  );
};

export default Home;
