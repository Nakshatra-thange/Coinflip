"use client"

import { useEffect, useState } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"

type BetHistoryItem = {
  result: "heads" | "tails"
  won: boolean
  balanceBefore: number
  balanceAfter: number
  timestamp: string
  betAmount?: number
}

export default function DemoPage() {
  const { publicKey, connected } = useWallet()

  const [balance, setBalance] = useState<number | null>(null)
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<"heads" | "tails" | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    result: "heads" | "tails"
    won: boolean
    betAmount: number
  } | null>(null)
  const [history, setHistory] = useState<BetHistoryItem[]>([])
  const [showAnimation, setShowAnimation] = useState(false)

  // Initialize + Load History
  useEffect(() => {
    const init = async () => {
      if (!publicKey) return
      setLoading(true)

      try {
        const wallet = publicKey.toBase58()

        const initRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/demo/initialize`,
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

  // Place Bet
  const handlePlaceBet = async () => {
    if (!publicKey || !selectedBet || !selectedChoice || balance === null) return

    setLoading(true)
    setShowAnimation(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/demo/place-bet`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            betAmount: selectedBet,
            choice: selectedChoice,
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
    selectedChoice !== null &&
    balance !== null &&
    balance >= selectedBet

  return (
    <main className="min-h-screen p-6 flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-yellow-400 text-black font-semibold text-center p-3 rounded-lg">
        DEMO MODE — NOT REAL MONEY
      </div>

      <div className="flex justify-end">
        <WalletMultiButton />
      </div>

      {/* Balance */}
      <div>
        <h1 className="text-3xl font-bold">Coin Flip Demo</h1>
        <div className="text-xl font-semibold mt-2">
          Balance: {balance !== null ? balance.toFixed(2) : "--"} SOL
        </div>
      </div>

      {/* Bet Buttons */}
      <div className="flex gap-3 flex-wrap">
        {betOptions.map((bet) => (
          <button
            key={bet}
            onClick={() => setSelectedBet(bet)}
            className={`px-6 py-3 rounded-lg border font-semibold
              ${
                selectedBet === bet
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            {bet} SOL
          </button>
        ))}
      </div>

      {/* Choice */}
      <div className="flex gap-4">
        {["heads", "tails"].map((c) => (
          <button
            key={c}
            onClick={() => setSelectedChoice(c as any)}
            className={`px-8 py-4 rounded-lg font-bold text-lg
              ${
                selectedChoice === c
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Place Bet */}
      <button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet}
        className={`px-10 py-4 rounded-lg font-bold text-lg
          ${
            canPlaceBet
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500"
          }`}
      >
        {loading ? "Processing..." : "Place Bet"}
      </button>

      {/* Coin Animation */}
      {showAnimation && (
        <div className="text-center text-2xl animate-pulse">
          🪙 Flipping Coin...
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`p-6 rounded-lg text-center text-2xl font-bold
            ${result.won ? "bg-green-500 text-white" : "bg-red-500 text-white"}
          `}
        >
          {result.won ? "YOU WON" : "YOU LOST"} — {result.result.toUpperCase()}
          <div className="text-lg mt-2">
            Bet: {result.betAmount} SOL
          </div>
          <div className="text-lg">
            Balance: {balance?.toFixed(2)} SOL
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3">Recent Bets</h2>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Bet</th>
                <th className="p-2 border">Choice</th>
                <th className="p-2 border">Result</th>
                <th className="p-2 border">Profit/Loss</th>
                <th className="p-2 border">Balance After</th>
              </tr>
            </thead>

            <tbody>
              {history.map((h, i) => {
                const profit = (h.balanceAfter - h.balanceBefore).toFixed(2)

                return (
                  <tr key={i}>
                    <td className="p-2 border">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2 border">{h.betAmount ?? "-"}</td>
                    <td className="p-2 border">{h.result}</td>
                    <td className="p-2 border">{h.result}</td>
                    <td
                      className={`p-2 border font-semibold ${
                        h.won ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {profit}
                    </td>
                    <td className="p-2 border">
                      {h.balanceAfter.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
