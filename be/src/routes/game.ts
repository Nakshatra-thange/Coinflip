import { Hono } from "hono"
import { Connection, PublicKey, Keypair } from "@solana/web3.js"
//import bs58 from "bs58"
import fs from "fs"
import { prisma } from "../../db" 

import { buildBetTransaction } from "../solana/buildBetTransaction"

const game = new Hono()
const connection = new Connection(process.env.SOLANA_RPC_URL!,"confirmed")

game.post("/create-bet", async (c) => {
    try {
      const { walletAddress, betAmount } = await c.req.json()
  
      if (!walletAddress || !betAmount) {
        return c.json({ error: "Missing params" }, 400)
      }
  
      const allowedBets = [0.1, 0.3, 0.5, 1.0]
      if (!allowedBets.includes(betAmount)) {
        return c.json({ error: "Invalid bet amount" }, 400)
        
      }

      const result = Math.random()<0.5?"heads":"tails"
      const won = result === "heads"

      const houseKeypairPath = process.env.HOUSE_WALLET_KEYPAIR_PATH!
      const houseSecret = JSON.parse(fs.readFileSync(houseKeypairPath, "utf-8"))
    const houseKeypair = Keypair.fromSecretKey(Uint8Array.from(houseSecret))
    if (!houseKeypairPath) {
      throw new Error("HOUSE_WALLET_KEYPAIR_PATH missing from env")
    }
    
    const tx = await buildBetTransaction({
        connection,
        userPubkey: new PublicKey(walletAddress),
        housePubkey: houseKeypair.publicKey,
        betAmountSol: betAmount,
        won,
      })

      tx.partialSign(houseKeypair)
      const serializedTx= tx.serialize({
        requireAllSignatures: false,
      }).toString("base64")

      return c.json({
        transaction: serializedTx,
        result,
        won,
      })
  
    } catch (err) {
      console.error("CREATE BET ERROR:", err)
      return c.json({ error: "Failed to create bet" }, 500)
    }
  })

  game.post("/record-bet", async (c) => {
    try {
      const {
        txSignature,
        walletAddress,
        betAmount,
        result,
        won,
      } = await c.req.json()

      if (!txSignature || !walletAddress || !betAmount || result === undefined || won === undefined) {
        return c.json({ error: "Missing required fields" }, 400)
      }
  
      const allowedBets = [0.1, 0.3, 0.5, 1.0]
      if (!allowedBets.includes(betAmount)) {
        return c.json({ error: "Invalid bet amount" }, 400)
      }
  
      if (result !== "heads" && result !== "tails") {
        return c.json({ error: "Invalid result" }, 400)
      }
      await prisma.realBet.create({
        data: {
          txSignature,
          walletAddress,
          betAmount,
          result,
          won,
        },
      })

      return c.json({
        success: true,
        
      })
  
    } catch (err) {
      console.error("RECORD BET ERROR:", err)
  
      return c.json({
        error: "Failed to record bet",
      }, 500)
    }
  })
  
  game.get("/history/:walletAddress", async (c) => {
    try {
      const walletAddress = c.req.param("walletAddress")
  
      if (!walletAddress) {
        return c.json({ error: "Wallet address required" }, 400)
      }
  
      const bets = await prisma.realBet.findMany({
        where: {
          walletAddress,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      })
  
      return c.json({
        bets,
      })
  
    } catch (err) {
      console.error("REAL HISTORY ERROR:", err)
  
      return c.json({
        error: "Failed to fetch history",
      }, 500)
    }
  })
  
  

  
  export default game;