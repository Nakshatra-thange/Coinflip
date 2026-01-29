"use client"

import dynamic from "next/dynamic"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Transaction } from "@solana/web3.js"

const WalletButton = dynamic(
  () => import("@/components/wallet-button-client"),
  { ssr: false }
)

type BetHistoryItem = {
  txSignature: string
  betAmount: number
  result: "heads" | "tails"
  won: boolean
  createdAt: string
}

export default function PlayPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const [walletSol, setWalletSol] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [selectedBet, setSelectedBet] = useState<number | null>(null)

  const [loadingTx, setLoadingTx] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [txPending, setTxPending] = useState(false)
  const [txConfirmed, setTxConfirmed] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [history, setHistory] = useState<BetHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const betOptions = [0.1, 0.3, 0.5, 1.0]

  const hasEnoughBalance =
    walletSol !== null &&
    selectedBet !== null &&
    walletSol >= selectedBet

  /* ---------------- BALANCE ---------------- */

  const fetchBalance = async () => {
    if (!publicKey) return
    try {
      setLoadingBalance(true)
      const lamports = await connection.getBalance(publicKey)
      setWalletSol(lamports / 1e9)
    } catch {
      setErrorMessage("Failed to fetch wallet balance")
    } finally {
      setLoadingBalance(false)
    }
  }

  /* ---------------- HISTORY ---------------- */

  const fetchHistory = async () => {
    if (!publicKey) return
    try {
      setLoadingHistory(true)

      const res = await fetch(
        `http://localhost:3001/api/game/history/${publicKey.toBase58()}`
      )

      if (!res.ok) throw new Error()

      const data = await res.json()
      setHistory(data.bets || [])

    } catch {
      setErrorMessage("Failed to load history")
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
      fetchHistory()
    }
  }, [connected, publicKey])

  /* ---------------- CONFIRMATION ---------------- */

  const waitForConfirmation = async (signature: string) => {
    const timeoutMs = 30000
    const start = Date.now()

    while (Date.now() - start < timeoutMs) {
      const status = await connection.getSignatureStatus(signature)

      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) return true

      await new Promise(res => setTimeout(res, 2000))
    }

    return false
  }

  /* ---------------- RECORD ---------------- */

  const recordBet = async (
    signature: string,
    betAmount: number,
    result: "heads" | "tails",
    won: boolean
  ) => {
    if (!publicKey) return

    try {
      await fetch("http://localhost:3001/api/game/record-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSignature: signature,
          walletAddress: publicKey.toBase58(),
          betAmount,
          result,
          won,
        }),
      })

      setHistory(prev => [
        {
          txSignature: signature,
          betAmount,
          result,
          won,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    } catch {
      setErrorMessage("Failed to record bet")
    }
  }

  /* ---------------- MAIN FLOW ---------------- */

  const handlePlaceBet = async () => {
    if (!publicKey || !selectedBet) return

    if (!hasEnoughBalance) {
      setErrorMessage("Insufficient wallet balance")
      return
    }

    try {
      setLoadingTx(true)
      setErrorMessage(null)
      setTxConfirmed(false)

      /* CREATE BET */

      const res = await fetch(
        "http://localhost:3001/api/game/create-bet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            betAmount: selectedBet,
          }),
        }
      )

      if (!res.ok) throw new Error("create-bet failed")

      const data = await res.json()

      /* TX */

      const txBuffer = Buffer.from(data.transaction, "base64")
      const tx = Transaction.from(txBuffer)

      /* SIGN */

      const signedTx = await window.solana.signTransaction(tx)

      /* SEND */

      setTxPending(true)

      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      )

      setTxSignature(signature)

      /* CONFIRM */

      const confirmed = await waitForConfirmation(signature)

      if (!confirmed) {
        setErrorMessage("Transaction confirmation timeout")
        setTxPending(false)
        return
      }

      setTxConfirmed(true)
      setTxPending(false)

      /* RECORD */

      await recordBet(signature, selectedBet, data.result, data.won)

      fetchBalance()
      fetchHistory()

    } catch (err: any) {

      if (err?.message?.includes("User rejected")) {
        setErrorMessage("Transaction rejected by wallet")
      } else if (err?.message?.includes("Network")) {
        setErrorMessage("Network error — check connection")
      } else {
        setErrorMessage("Transaction failed")
      }

    } finally {
      setLoadingTx(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col gap-8">

      <div className="bg-purple-500 text-white font-bold text-center p-3 rounded-xl">
        DEVNET MODE — TEST SOL ONLY
      </div>

      <div className="flex justify-end">
        <WalletButton />
      </div>

      <h1 className="text-4xl font-bold">Real Coin Flip</h1>

      {/* Balance */}
      <div className="flex items-center gap-6 text-lg">
        <div>
          Wallet Balance:
          <span className="ml-2 font-mono">
            {walletSol?.toFixed(3) ?? "--"} SOL
          </span>
        </div>

        <button
          onClick={fetchBalance}
          disabled={loadingBalance}
          className="px-4 py-2 bg-gray-800 rounded-lg"
        >
          {loadingBalance ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Errors */}
      {errorMessage && (
        <div className="bg-red-900 p-4 rounded flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-4 px-3 py-1 bg-red-700 rounded"
          >
            Close
          </button>
        </div>
      )}

      {/* Bets */}
      <div className="flex gap-4 flex-wrap">
        {betOptions.map(bet => (
          <button
            key={bet}
            onClick={() => setSelectedBet(bet)}
            className={`px-6 py-3 rounded-xl ${
              selectedBet === bet
                ? "bg-purple-600"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {bet} SOL
          </button>
        ))}
      </div>

      {/* Flip */}
      <button
        onClick={handlePlaceBet}
        disabled={!selectedBet || !hasEnoughBalance || loadingTx}
        className={`px-12 py-5 rounded-xl text-xl font-bold ${
          selectedBet && hasEnoughBalance && !loadingTx
            ? "bg-white text-black"
            : "bg-gray-700 text-gray-400"
        }`}
      >
        {loadingTx ? "Processing..." : "Flip Coin"}
      </button>

      {/* Pending */}
      {txPending && txSignature && (
        <div className="bg-yellow-900 p-4 rounded">
          Pending…
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            className="underline ml-3"
          >
            View
          </a>
        </div>
      )}

      {/* Confirmed */}
      {txConfirmed && txSignature && (
        <div className="bg-green-900 p-4 rounded">
          Confirmed ✅
        </div>
      )}

      {/* HISTORY */}
      <div>
        <h2 className="text-2xl font-bold mb-3">Recent Bets</h2>

        {loadingHistory && <p>Loading history...</p>}

        {history.map(h => (
          <div
            key={h.txSignature}
            className="border-b border-gray-800 py-3 flex justify-between"
          >
            <div>
              {h.betAmount} SOL — {h.result} — {h.won ? "Win" : "Lose"}
            </div>

            <a
              href={`https://explorer.solana.com/tx/${h.txSignature}?cluster=devnet`}
              target="_blank"
              className="text-blue-400 underline text-sm"
            >
              View TX
            </a>
          </div>
        ))}
      </div>

    </main>
  )
}
