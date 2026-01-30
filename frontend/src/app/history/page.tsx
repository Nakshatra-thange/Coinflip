'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useWallet } from '@solana/wallet-adapter-react'

const WalletButton = dynamic(
  () => import('@/components/wallet-button-client'),
  { ssr: false }
)

/* ---------------- TYPES ---------------- */

type DemoBet = {
  betAmount: number
  result: 'heads' | 'tails'
  won: boolean
  balanceAfter: number
  timestamp: string
}

type RealBet = {
  betAmount: number
  result: 'heads' | 'tails'
  won: boolean
  txSignature: string
  timestamp: string
}

/* ---------------- PAGE ---------------- */

export default function HistoryPage() {
  const { connected, publicKey } = useWallet()

  const [activeTab, setActiveTab] = useState<'demo' | 'real'>('demo')
  const [demoBets, setDemoBets] = useState<DemoBet[]>([])
  const [realBets, setRealBets] = useState<RealBet[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [winsOnly, setWinsOnly] = useState(false)
  const [lossesOnly, setLossesOnly] = useState(false)

  /* ---------------- SAFE DATE ---------------- */

  const formatDate = (ts: any) => {
    if (!ts) return '--'
    const d = new Date(ts)
    if (isNaN(d.getTime())) return '--'
    return d.toLocaleString()
  }

  /* ---------------- FETCH HISTORY ---------------- */

  useEffect(() => {
    if (!connected || !publicKey) return

    const wallet = publicKey.toBase58()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [demoRes, realRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/history/${wallet}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/history/${wallet}`)
        ])

        if (!demoRes.ok || !realRes.ok) throw new Error()

        const demo = await demoRes.json()
        const real = await realRes.json()

        setDemoBets(demo.bets || [])
        setRealBets(real.bets || [])

      } catch {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [connected, publicKey])

  /* ---------------- FILTERING ---------------- */

  const filteredDemo = useMemo(() => {
    return demoBets.filter(b =>
      winsOnly ? b.won : lossesOnly ? !b.won : true
    )
  }, [demoBets, winsOnly, lossesOnly])

  const filteredReal = useMemo(() => {
    return realBets.filter(b =>
      winsOnly ? b.won : lossesOnly ? !b.won : true
    )
  }, [realBets, winsOnly, lossesOnly])

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => {
    const bets = activeTab === 'demo' ? filteredDemo : filteredReal

    const total = bets.length
    const wins = bets.filter(b => b.won).length

    const pnl = bets.reduce(
      (sum, b) => sum + (b.won ? b.betAmount : -b.betAmount),
      0
    )

    return {
      total,
      winRate: total ? ((wins / total) * 100).toFixed(1) : '0.0',
      pnl
    }
  }, [activeTab, filteredDemo, filteredReal])

  /* ---------------- NOT CONNECTED ---------------- */

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#001f3f] via-[#002a54] to-[#001f3f] text-white">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-serif text-[#f0dd58]">
            Connect Wallet To View History
          </h2>
          <WalletButton />
        </div>
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  const currentData = activeTab === 'demo' ? filteredDemo : filteredReal

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#001f3f] via-[#002a54] to-[#001f3f] text-white p-8 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-serif text-[#f0dd58]">Game History</h1>
        <WalletButton />
      </div>

      {/* TABS */}
      <div className="flex gap-10 border-b border-[#f0dd58]/20">
        {['demo','real'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-lg font-serif transition ${
              activeTab === tab
                ? 'text-[#f0dd58] border-b-2 border-[#f0dd58]'
                : 'text-[#f0dd58]/50 hover:text-[#f0dd58]'
            }`}
          >
            {tab === 'demo' ? 'Demo History' : 'Real Game History'}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-[#002a54]/50 border border-[#f0dd58]/20 p-6 rounded-xl">
          <div className="text-sm text-[#f0dd58]/60">Total Bets</div>
          <div className="text-3xl font-serif text-[#f0dd58]">{stats.total}</div>
        </div>

        <div className="bg-[#002a54]/50 border border-[#f0dd58]/20 p-6 rounded-xl">
          <div className="text-sm text-[#f0dd58]/60">Win Rate</div>
          <div className="text-3xl font-serif text-[#f0dd58]">{stats.winRate}%</div>
        </div>

        <div className="bg-[#002a54]/50 border border-[#f0dd58]/20 p-6 rounded-xl">
          <div className="text-sm text-[#f0dd58]/60">Profit / Loss</div>
          <div className={`text-3xl font-serif ${stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.pnl.toFixed(3)} {activeTab === 'demo' ? 'Credits' : 'SOL'}
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="flex gap-10 text-[#f0dd58]/70">

        <label className="flex gap-2 items-center cursor-pointer">
          <input
            type="checkbox"
            checked={winsOnly}
            onChange={() => {
              setWinsOnly(!winsOnly)
              setLossesOnly(false)
            }}
          />
          Wins Only
        </label>

        <label className="flex gap-2 items-center cursor-pointer">
          <input
            type="checkbox"
            checked={lossesOnly}
            onChange={() => {
              setLossesOnly(!lossesOnly)
              setWinsOnly(false)
            }}
          />
          Losses Only
        </label>

      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-[#f0dd58]">Loading history...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : currentData.length === 0 ? (
        <div className="text-[#f0dd58]/60">No bets found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#f0dd58]/20">

          <table className="w-full">

            <thead className="bg-[#001f3f] border-b border-[#f0dd58]/20">
              <tr>
                <th className="p-4 text-left text-[#f0dd58]">Time</th>
                <th className="p-4 text-left text-[#f0dd58]">Bet</th>
                <th className="p-4 text-left text-[#f0dd58]">Result</th>
                <th className="p-4 text-left text-[#f0dd58]">P/L</th>
                {activeTab === 'demo'
                  ? <th className="p-4 text-left text-[#f0dd58]">Balance</th>
                  : <th className="p-4 text-left text-[#f0dd58]">Transaction</th>}
              </tr>
            </thead>

            <tbody>

              {currentData.map((b:any, i:number) => (

                <tr key={i} className="border-t border-[#f0dd58]/10 hover:bg-[#001f3f]/40">

                  <td className="p-4 text-[#f0dd58]/80">
                    {formatDate(b.timestamp)}
                  </td>

                  <td className="p-4 text-white font-semibold">
                    {b.betAmount}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${b.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                    `}>
                      {b.result.toUpperCase()} {b.won ? 'WIN' : 'LOSS'}
                    </span>
                  </td>

                  <td className={`p-4 font-semibold ${b.won ? 'text-green-400' : 'text-red-400'}`}>
                    {b.won ? '+' : '-'}{b.betAmount}
                  </td>

                  {activeTab === 'demo' ? (
                    <td className="p-4 text-[#f0dd58]/80">
                      {b.balanceAfter}
                    </td>
                  ) : (
                    <td className="p-4">
                      <a
                        href={`https://explorer.solana.com/tx/${b.txSignature}?cluster=devnet`}
                        target="_blank"
                        className="text-[#f0dd58] underline font-mono"
                      >
                        View TX
                      </a>
                    </td>
                  )}

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </main>
  )
}
