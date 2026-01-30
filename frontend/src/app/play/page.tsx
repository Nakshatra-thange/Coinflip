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

  /* ---------------- CONFIRM ---------------- */

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

      if (!res.ok) throw new Error()

      const data = await res.json()

      const txBuffer = Buffer.from(data.transaction, "base64")
      const tx = Transaction.from(txBuffer)

      const signedTx = await window.solana.signTransaction(tx)

      setTxPending(true)

      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      )

      setTxSignature(signature)

      const confirmed = await waitForConfirmation(signature)

      if (!confirmed) {
        setErrorMessage("Transaction confirmation timeout")
        setTxPending(false)
        return
      }

      setTxConfirmed(true)
      setTxPending(false)

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
    <main className="min-h-screen bg-gradient-to-b from-[#001f3f] via-[#002a54] to-[#001f3f] text-white p-8 flex flex-col gap-8">

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#f0dd58] to-[#ead84e] text-[#001f3f] font-bold text-center p-3 rounded-xl shadow-lg shadow-[#f0dd58]/30">
        DEVNET MODE — TEST SOL ONLY
      </div>

      {/* Wallet */}
      <div className="flex justify-end">
        <WalletButton />
      </div>

      <h1 className="text-4xl font-serif text-[#f0dd58]">Real Coin Flip</h1>

      {/* Balance */}
      <div className="flex items-center gap-6 text-lg">
        <div>
          Wallet Balance:
          <span className="ml-2 font-mono text-[#f0dd58]">
            {walletSol?.toFixed(3) ?? "--"} SOL
          </span>
        </div>

        <button
          onClick={fetchBalance}
          disabled={loadingBalance}
          className="px-4 py-2 bg-[#002a54] border border-[#f0dd58]/30 rounded-lg hover:border-[#f0dd58]/60 transition"
        >
          {loadingBalance ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Errors */}
      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 flex justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="px-3 py-1 bg-red-500/30 rounded"
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
            className={`px-6 py-3 rounded-xl font-semibold transition
              ${
                selectedBet === bet
                  ? "bg-gradient-to-r from-[#f0dd58] to-[#ead84e] text-[#001f3f]"
                  : "bg-[#002a54] border border-[#f0dd58]/20 hover:border-[#f0dd58]/60"
              }
            `}
          >
            {bet} SOL
          </button>
        ))}
      </div>

      {/* Flip */}
      <button
        onClick={handlePlaceBet}
        disabled={!selectedBet || loadingTx}
        className={`px-12 py-5 rounded-xl text-xl font-bold transition
          ${
            selectedBet && !loadingTx
              ? "bg-gradient-to-r from-[#f0dd58] to-[#ead84e] text-[#001f3f] hover:scale-105"
              : "bg-gray-700 text-gray-400"
          }
        `}
      >
        {loadingTx ? "Preparing Transaction..." : "Flip Coin (Real)"}
      </button>

      {/* Pending */}
      {txPending && txSignature && (
        <div className="bg-yellow-400/20 border border-yellow-400 rounded-xl p-4">
          Pending…
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            className="underline ml-3 text-[#f0dd58]"
          >
            View
          </a>
        </div>
      )}

      {/* Confirmed */}
      {txConfirmed && txSignature && (
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          Confirmed ✅
        </div>
      )}

      {/* HISTORY */}
      <div>
        <h2 className="text-2xl font-serif text-[#f0dd58] mb-3">Recent Bets</h2>

        {loadingHistory && <p>Loading history...</p>}

        {history.map(h => (
          <div
            key={h.txSignature}
            className="border-b border-[#f0dd58]/20 py-3 flex justify-between"
          >
            <div>
              {h.betAmount} SOL — {h.result} — {h.won ? "Win" : "Lose"}
            </div>

            <a
              href={`https://explorer.solana.com/tx/${h.txSignature}?cluster=devnet`}
              target="_blank"
              className="text-[#f0dd58] underline text-sm"
            >
              View TX
            </a>
          </div>
        ))}
      </div>

    </main>
  )
}
