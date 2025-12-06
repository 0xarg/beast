import React from "react";
import { cn } from "../lib/utils";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("relative z-10 mx-auto w-full max-w-7xl p-4", className)}
    >
      {children}
    </div>
  );
};

export default Container;
