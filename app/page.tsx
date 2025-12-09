import React from "react";
import Container from "./components/container";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import Features2 from "./components/features2";
import Footer from "./components/footer";

const Home = () => {
  return (
    <div className="w-full">
      <div className="font-display w-full bg-[#FDF2EC]">
        <Container>
          <Navbar />
          <Hero />
        </Container>
      </div>
      <div className="font-display h w-full bg-[#F8F3FF]">
        <Container>
          <Features />
        </Container>
      </div>
      <div className="font-display w-full bg-[#FDF2EC]">
        <Container className="">
          <Features2 />
        </Container>
      </div>
      <div className="font-display w-full bg-[#222222]">
        <Container>
          <Footer />
        </Container>
      </div>
    </div>
  );
};

export default Home;
