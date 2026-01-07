"use client";
import React from "react";
import Navbar from "../components/navbar";
import Container from "../components/container";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const page = () => {
  return (
    <div className="h-screen w-full">
      <Navbar />
      <Container>
        <div className="flex h-screen items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Launch your Personal Token</CardTitle>
              <CardDescription>
                Enter the details below to create one,
              </CardDescription>
              {/* <CardAction>
                <Button variant="link">Sign Up</Button>
              </CardAction> */}
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Solana"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      type="text"
                      placeholder="Eg: SOL, BTC, ETH, BETH"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Image URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://image.webp"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supply">Initial Supply</Label>
                    <Input
                      id="supply"
                      type="number"
                      placeholder="Solana"
                      required
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex w-full items-start justify-start gap-5">
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" />
                  <HoverCard>
                    <HoverCardTrigger>Revole Freeze</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to freeze holders' token accounts
                      anymore
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" />
                  <HoverCard>
                    <HoverCardTrigger>Revole Mint</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to create more tokens anymore
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" />
                  <HoverCard>
                    <HoverCardTrigger>Revole Update</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to modify token metadata anymore
                      anymore
                    </HoverCardContent>
                  </HoverCard>{" "}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </CardFooter>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default page;
