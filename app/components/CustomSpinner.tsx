"use client";

import { Spinner } from "@/components/ui/spinner";
const CustomSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Spinner className="my-3 size-10 w-full text-neutral-700" />
  </div>
);
export default CustomSpinner;
