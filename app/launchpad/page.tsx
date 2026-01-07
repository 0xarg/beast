"use client";
import React, { useCallback, useState } from "react";
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
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import ConnectWallet from "../components/connectWallet";

interface MetaData {
  name: string;
  symbol: string;
  imageUrl: string;
  supply: number;
  isFreeze: boolean;
  isUpdate: boolean;
  isMint: boolean;
}

const page = () => {
  const [data, setData] = useState<MetaData>({
    name: "",
    symbol: "",
    imageUrl: "",
    supply: 0,
    isFreeze: false,
    isMint: false,
    isUpdate: false,
  });
  const { connection } = useConnection();
  const wallet = useWallet();

  const createToken = useCallback(async () => {
    if (!wallet || !wallet.publicKey) {
      return;
    }

    const mintKeypair = Keypair.generate();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: data.name ?? "X",
      symbol: data.symbol ?? "X",
      uri: "https://raw.githubusercontent.com/0xarg/beast/refs/heads/main/lib/metadata.json",
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen,
    );

    const associatedToken = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log(associatedToken.toBase58());

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      }),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedToken,
        wallet.publicKey,
        LAMPORTS_PER_SOL * (data.supply ?? 1),
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
      createSetAuthorityInstruction(
        mintKeypair.publicKey, // mint
        wallet.publicKey, // current mint authority
        AuthorityType.MintTokens,
        data.isMint ? null : wallet.publicKey,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
      createSetAuthorityInstruction(
        mintKeypair.publicKey, // mint
        wallet.publicKey, // current mint authority
        AuthorityType.FreezeAccount,
        data.isFreeze ? null : wallet.publicKey,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);
    await wallet.sendTransaction(transaction, connection);
  }, [data]);
  if (!wallet || !wallet.publicKey) {
    return <ConnectWallet />;
  }
  return (
    <div className="h-screen w-full bg-neutral-100">
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createToken();
                }}
              >
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Solana"
                      value={data.name}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      type="text"
                      value={data.symbol}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          symbol: e.target.value,
                        }))
                      }
                      placeholder="Eg: SOL, BTC, ETH, BETH"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Image URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={data.imageUrl}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      placeholder="https://image.webp"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supply">Initial Supply</Label>
                    <Input
                      id="supply"
                      value={data.supply}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          supply: Number(e.target.value),
                        }))
                      }
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
                  <Checkbox
                    id="terms"
                    checked={data?.isFreeze}
                    onCheckedChange={(checked) =>
                      setData((prev) => ({
                        ...prev,
                        isFreeze: checked === true,
                      }))
                    }
                  />
                  <HoverCard>
                    <HoverCardTrigger>Revoke Freeze</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to freeze holders' token accounts
                      anymore
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="isMint"
                    checked={data?.isMint}
                    onCheckedChange={(checked) =>
                      setData((prev) => ({ ...prev, isMint: checked === true }))
                    }
                  />
                  <HoverCard>
                    <HoverCardTrigger>Revoke Mint</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to create more tokens anymore
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="isUpdate"
                    checked={data?.isUpdate}
                    onCheckedChange={(checked) =>
                      setData((prev) => ({
                        ...prev,
                        isUpdate: checked === true,
                      }))
                    }
                  />
                  <HoverCard>
                    <HoverCardTrigger>Revoke Update</HoverCardTrigger>
                    <HoverCardContent>
                      No one will be able to modify token metadata anymore
                      anymore
                    </HoverCardContent>
                  </HoverCard>{" "}
                </div>
              </div>
              <Button onClick={() => createToken()} className="w-full">
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
