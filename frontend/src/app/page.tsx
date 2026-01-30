'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const WalletButton = dynamic(
  () => import('@/components/wallet-button-client'),
  { ssr: false }
);

export default function Home() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinSide, setCoinSide] = useState('heads');

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCoinSide(prev => prev === 'heads' ? 'tails' : 'heads');
        setIsFlipping(false);
      }, 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001f3f] via-[#002a54] to-[#001f3f]">
  
      {/* NAVBAR — UNCHANGED */}
      <nav className="fixed top-0 w-full bg-[#001f3f]/90 backdrop-blur-md border-b border-[#f0dd58]/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
  
            <Link
              href="/"
              className="text-2xl font-serif tracking-wide text-[#f0dd58]"
            >
              SOLANA FLIP
            </Link>
  
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-[#f0dd58]/70 hover:text-[#f0dd58] transition">
                Home
              </Link>
              <Link href="/demo" className="text-sm text-[#f0dd58]/70 hover:text-[#f0dd58] transition">
                Demo
              </Link>
              <Link href="/play" className="text-sm text-[#f0dd58]/70 hover:text-[#f0dd58] transition">
                Play
              </Link>
              <Link href="/history" className="text-sm text-[#f0dd58]/70 hover:text-[#f0dd58] transition">
                History
              </Link>
  
              <WalletButton />
            </div>
  
            <button className="md:hidden text-[#f0dd58]">☰</button>
          </div>
        </div>
      </nav>
  
      {/* HERO — UNCHANGED */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
  
          {/* COIN */}
          <div className="relative">
            <div className="aspect-[3/4] bg-gradient-to-br from-[#002a54]/50 to-[#001f3f]/50 rounded-lg border border-[#f0dd58]/20 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative z-10">
  
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className={`w-full h-full rounded-full transition-transform duration-700 ${isFlipping ? 'animate-spin' : ''}`}>
                      {coinSide === 'heads' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f0dd58] to-[#ead84e] flex items-center justify-center text-5xl text-[#001f3f] font-bold">
                          ₿
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#003d6b] to-[#001f3f] flex items-center justify-center text-5xl text-[#f0dd58] font-bold">
                          ◈
                        </div>
                      )}
                    </div>
                  </div>
  
                  <p className="text-[#f0dd58] text-lg">
                    50/50 • Provably Fair • Instant
                  </p>
  
                </div>
              </div>
            </div>
          </div>
  
          {/* TEXT */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-[#f0dd58]">
                Welcome To The Future Of Gaming
              </p>
  
              <h1 className="text-5xl md:text-6xl font-serif text-white leading-tight">
                Discover & <span className="italic">Monetize</span> Your Luck Using
                <br />
                <span className="bg-gradient-to-r from-[#f0dd58] to-[#ead84e] bg-clip-text text-transparent">
                  Solana
                </span>
              </h1>
  
              <p className="text-lg text-[#f0dd58]/70 max-w-xl">
                Test your intuition in the world's most transparent coin flipping game.
                Powered by Solana blockchain for instant, provably fair results.
              </p>
            </div>
  
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link
                href="/demo"
                className="px-8 py-4 border-2 border-[#f0dd58] text-[#f0dd58] rounded-full font-semibold hover:bg-[#f0dd58] hover:text-[#001f3f] transition"
              >
                Try Demo →
              </Link>
  
              <Link
                href="/play"
                className="px-8 py-4 bg-gradient-to-r from-[#f0dd58] to-[#ead84e] text-[#001f3f] rounded-full font-semibold hover:scale-105 transition"
              >
                Play Real →
              </Link>
            </div>
          </div>
  
        </div>
      </section>
  
      {/* FEATURES */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#001f3f] to-[#002a54]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
  
          {[
            {
              title: "⚡ Instant Results",
              desc: "Lightning-fast transactions powered by Solana blockchain.",
            },
            {
              title: "🔒 Provably Fair",
              desc: "Every flip is verifiable on-chain with full transparency.",
            },
            {
              title: "💰 Low Fees",
              desc: "Minimal transaction costs thanks to Solana efficiency.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#002a54]/50 p-8 rounded-lg border border-[#f0dd58]/20 hover:border-[#f0dd58]/40 transition"
            >
              <h3 className="text-2xl font-serif text-[#f0dd58] mb-3">{f.title}</h3>
              <p className="text-[#f0dd58]/70">{f.desc}</p>
            </div>
          ))}
  
        </div>
      </section>
  
      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-[#001f3f]">
        <div className="max-w-5xl mx-auto space-y-12">
  
          {[
            ["1", "Connect Wallet"],
            ["2", "Choose Bet Amount"],
            ["3", "Flip & Win"],
          ].map(([num, text]) => (
            <div key={num} className="flex gap-6 items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f0dd58] to-[#ead84e] flex items-center justify-center text-[#001f3f] font-bold text-2xl">
                {num}
              </div>
              <h3 className="text-xl text-[#f0dd58]">{text}</h3>
            </div>
          ))}
  
        </div>
      </section>
  
      {/* FOOTER */}
      <footer className="bg-[#001f3f] border-t border-[#f0dd58]/20 py-12 text-center text-[#f0dd58]/60">
        <p>© 2026 Solana Flip — Devnet Edition</p>
      </footer>
  
    </div>
  )
}  