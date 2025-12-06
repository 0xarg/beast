import React from "react";
import Container from "./components/container";
import Navbar from "./components/navbar";

const Home = () => {
  return (
    <div className="h-screen w-full bg-[#FDF2EC]">
      <Container>
        <Navbar />
      </Container>
    </div>
  );
};

export default Home;
