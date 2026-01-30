"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import dynamic from "next/dynamic"

type BetHistoryItem = {
  result: "heads" | "tails"
  won: boolean
  balanceBefore: number
  balanceAfter: number
  timestamp: string
  betAmount: number
}

const WalletButton = dynamic(
  () => import("@/components/wallet-button-client"),
  { ssr: false }
)

export default function DemoPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const [walletSol, setWalletSol] = useState<number | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [result, setResult] = useState<{
    result: "heads" | "tails"
    won: boolean
    betAmount: number
  } | null>(null)

  const [history, setHistory] = useState<BetHistoryItem[]>([])
  const [showAnimation, setShowAnimation] = useState(false)

  /* ---------------- WALLET SOL BALANCE ---------------- */
  useEffect(() => {
    const getSolBalance = async () => {
      if (!publicKey) return
  
      try {
        const lamports = await connection.getBalance(publicKey)
        setWalletSol(lamports / 1e9)
      } catch (err) {
        console.log("SOL balance fetch failed:", err)
        setWalletSol(null) // graceful fallback
      }
    }
  
    getSolBalance()
  }, [publicKey, connection])
  

  /* ---------------- DEMO INIT + HISTORY ---------------- */
  useEffect(() => {
    const init = async () => {
      if (!publicKey) return
      setLoading(true)

      try {
        const wallet = publicKey.toBase58()

        const initRes = await fetch(
          "http://localhost:3001/api/demo/initialize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: wallet }),
          }
        )

        const initData = await initRes.json()
        setBalance(Number(initData.balance))

        const histRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/demo/history/${wallet}`
        )

        const histData = await histRes.json()
        setHistory(histData.bets || [])
      } finally {
        setLoading(false)
      }
    }

    if (connected && publicKey) init()
  }, [connected, publicKey])

  /* ---------------- PLACE BET ---------------- */
  const handlePlaceBet = async () => {
    if (!publicKey || !selectedBet || balance === null) return

    setLoading(true)
    setShowAnimation(true)

    try {
      const res = await fetch(
        "http://localhost:3001/api/demo/place-bet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            betAmount: selectedBet,
          }),
        }
      )

      const data = await res.json()

      setTimeout(() => {
        setResult({
          result: data.result,
          won: data.won,
          betAmount: selectedBet,
        })

        setBalance(Number(data.balanceAfter))

        setHistory((prev) => [
          {
            result: data.result,
            won: data.won,
            balanceBefore: data.balanceBefore,
            balanceAfter: data.balanceAfter,
            timestamp: data.timestamp,
            betAmount: selectedBet,
          },
          ...prev,
        ])

        setShowAnimation(false)
        setTimeout(() => setResult(null), 5000)
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  const betOptions = [0.1, 0.3, 0.5, 1.0]

  const canPlaceBet =
    !loading &&
    selectedBet !== null &&
    balance !== null &&
    balance >= selectedBet

    const safeFixed = (val: any, digits = 2) => {
      const num = Number(val)
      return isNaN(num) ? "--" : num.toFixed(digits)
    }
    
  

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#001f3f] via-[#002a54] to-[#001f3f] text-white p-8 flex flex-col gap-8">

      {/* Banner */}
      <div className="bg-[#f0dd58] text-[#001f3f] font-bold text-center p-3 rounded-xl shadow-lg">
        DEMO MODE — NOT REAL MONEY
      </div>

      {/* Wallet */}
      <div className="flex justify-end">
        <WalletButton />
      </div>

      {/* Title + Balances */}
      <div>
        <h1 className="text-5xl font-serif text-[#f0dd58] mb-4">
          Coin Flip Demo
        </h1>

        <div className="flex gap-10 text-lg text-[#f0dd58]/80">
          <div>
            Wallet SOL:{" "}
            <span className="font-mono text-white">
  {safeFixed(walletSol)}
</span>

          </div>

          <div>
            Demo Balance:{" "}
            <span className="font-mono text-white">
              {balance?.toFixed(2) ?? "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Bet Buttons */}
      <div className="flex gap-4 flex-wrap">
        {betOptions.map((bet) => (
          <button
            key={bet}
            onClick={() => setSelectedBet(bet)}
            className={`px-6 py-3 rounded-xl font-semibold transition
            ${
              selectedBet === bet
                ? "bg-[#f0dd58] text-[#001f3f] shadow-lg"
                : "bg-[#002a54] border border-[#f0dd58]/20 hover:border-[#f0dd58]/50"
            }`}
          >
            {bet} SOL
          </button>
        ))}
      </div>

      {/* Place Bet */}
      <button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet}
        className={`px-12 py-5 rounded-xl text-xl font-bold transition
        ${
          canPlaceBet
            ? "bg-[#f0dd58] text-[#001f3f] hover:shadow-xl hover:shadow-[#f0dd58]/30"
            : "bg-[#002a54] text-gray-500"
        }`}
      >
        {loading ? "Processing..." : "Flip Coin"}
      </button>

      {/* Animation */}
      {showAnimation && (
        <div className="text-center text-3xl animate-pulse text-[#f0dd58]">
          🪙 Flipping Coin...
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`p-6 rounded-xl text-center text-3xl font-bold shadow-xl
          ${result.won
              ? "bg-green-500/20 border border-green-400 text-green-400"
              : "bg-red-500/20 border border-red-400 text-red-400"
            }`}
        >
          {result.won ? "YOU WON 🎉" : "YOU LOST 😢"}
          <div className="text-lg mt-2 text-white">
            Result: {result.result.toUpperCase()}
          </div>
          <div className="text-lg text-white">
            Bet: {result.betAmount} SOL
          </div>
          <div className="text-lg text-white">
            Balance: {balance?.toFixed(2)} SOL
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-3xl font-serif text-[#f0dd58] mb-4">
          Recent Bets
        </h2>

        <table className="w-full border border-[#f0dd58]/20 rounded-xl overflow-hidden">
          <thead className="bg-[#001f3f]">
            <tr>
              <th className="p-3 text-[#f0dd58]">Time</th>
              <th className="p-3 text-[#f0dd58]">Bet</th>
              <th className="p-3 text-[#f0dd58]">Result</th>
              <th className="p-3 text-[#f0dd58]">Profit</th>
              <th className="p-3 text-[#f0dd58]">Balance After</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h, i) => {
              const profit = (h.balanceAfter - h.balanceBefore).toFixed(2)

              return (
                <tr
                  key={i}
                  className="border-t border-[#f0dd58]/10 hover:bg-[#001f3f]/40"
                >
                  <td className="p-3 text-[#f0dd58]/80">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3">{h.betAmount}</td>
                  <td className="p-3 capitalize">{h.result}</td>
                  <td
                    className={`p-3 font-semibold ${
                      h.won ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {profit}
                  </td>
                  <td className="p-3">
  {Number(h.balanceAfter || 0).toFixed(2)}
</td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </main>
  )
}
