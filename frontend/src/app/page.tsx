'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-blue-950/90 backdrop-blur-md border-b border-yellow-500/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-serif tracking-wide text-yellow-400">
              SOLANA FLIP
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-yellow-100/70 hover:text-yellow-400 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-yellow-100/70 hover:text-yellow-400 transition">
                How It Works
              </a>
              <Link 
                href="/demo" 
                className="text-sm text-yellow-100/70 hover:text-yellow-400 transition"
              >
                Demo
              </Link>
              <Link 
                href="/play" 
                className="px-6 py-2 bg-yellow-400 text-blue-950 text-sm font-semibold rounded-full hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/30"
              >
                Play Real
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Column - Animated Coin */}
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-800/50 to-blue-950/50 rounded-lg overflow-hidden shadow-2xl border border-yellow-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Animated 3D Coin */}
                    <div className="relative w-48 h-48 mx-auto mb-8 perspective-1000">
                      <div 
                        className={`w-full h-full relative preserve-3d transition-transform duration-600 ${
                          isFlipping ? 'animate-flip' : ''
                        }`}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: coinSide === 'heads' ? 'rotateY(0deg)' : 'rotateY(180deg)'
                        }}
                      >
                        {/* Heads Side */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl backface-hidden border-8 border-yellow-300">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-blue-950">₿</div>
                            <div className="text-sm font-semibold text-blue-900 mt-2">HEADS</div>
                          </div>
                        </div>
                        
                        {/* Tails Side */}
                        <div 
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center shadow-2xl backface-hidden border-8 border-blue-500"
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <div className="text-center">
                            <div className="text-6xl font-bold text-yellow-400">◈</div>
                            <div className="text-sm font-semibold text-yellow-300 mt-2">TAILS</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
                    
                    <p className="text-yellow-400 font-light text-lg mt-4 relative z-10">
                      50/50 • Provably Fair • Instant
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-widest text-yellow-400 font-medium">
                  Welcome To The Future Of Gaming
                </p>
                <h1 className="text-5xl md:text-6xl font-serif leading-tight text-white">
                  Discover &<br />
                  <span className="italic">Monetize</span> Your<br />
                  Luck Using<br />
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Solana
                  </span>
                </h1>
                <p className="text-lg text-yellow-100/70 leading-relaxed max-w-xl">
                  Test your intuition in the world's most transparent coin flipping game. 
                  Powered by Solana blockchain for instant, provably fair results.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/demo"
                  className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 text-center rounded-full font-semibold hover:bg-yellow-400 hover:text-blue-950 transition-all duration-300 shadow-lg shadow-yellow-400/20"
                >
                  Try Demo →
                </Link>
                <Link 
                  href="/play"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-950 text-center rounded-full font-semibold hover:shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Play Real →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-yellow-500/20"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-400 font-medium mb-4">
              Why Choose Us
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-white">
              Built For The Modern <span className="italic">Player</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="space-y-4 bg-blue-900/50 p-8 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
                <svg className="w-8 h-8 text-blue-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-yellow-400">
                ⚡ Instant Results
              </h3>
              <p className="text-yellow-100/70 leading-relaxed">
                Lightning-fast transactions powered by Solana blockchain. 
                Get your results in milliseconds, not minutes. Experience gaming 
                at the speed of thought.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 bg-blue-900/50 p-8 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
                <svg className="w-8 h-8 text-blue-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-yellow-400">
                🔒 Provably Fair
              </h3>
              <p className="text-yellow-100/70 leading-relaxed">
                Every flip is verifiable on the blockchain. Complete transparency 
                means you can trust every outcome. No hidden algorithms, 
                just pure randomness.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 bg-blue-900/50 p-8 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
                <svg className="w-8 h-8 text-blue-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-yellow-400">
                💰 Low Fees
              </h3>
              <p className="text-yellow-100/70 leading-relaxed">
                Solana's efficiency means minimal transaction costs. 
                More of your winnings stay in your wallet. Play more, 
                pay less in fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-blue-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-400 font-medium mb-4">
              The Process
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-white">
              How It <span className="italic">Works</span>
            </h2>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/30">
                  <span className="text-3xl font-serif text-blue-950 font-bold">1</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-yellow-400">
                  Connect Your Wallet
                </h3>
                <p className="text-yellow-100/70 leading-relaxed">
                  Link your Solana wallet securely. We support all major Solana wallets 
                  including Phantom, Solflare, and more. Your funds remain in your control 
                  at all times.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/30">
                  <span className="text-3xl font-serif text-blue-950 font-bold">2</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-yellow-400">
                  Choose Your Side
                </h3>
                <p className="text-yellow-100/70 leading-relaxed">
                  Select heads or tails and decide your wager amount. Start small or go big - 
                  the choice is yours. Set your bet and prepare for the flip.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/30">
                  <span className="text-3xl font-serif text-blue-950 font-bold">3</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-yellow-400">
                  Watch & Win
                </h3>
                <p className="text-yellow-100/70 leading-relaxed">
                  Watch the coin flip in real-time with stunning animations. The blockchain 
                  determines the outcome fairly. Win and receive your payout instantly 
                  to your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link 
              href="/play"
              className="inline-block px-12 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-950 rounded-full font-semibold hover:shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Start Playing Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-16 px-6 border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-yellow-400">SOLANA FLIP</h3>
              <p className="text-yellow-100/60 text-sm leading-relaxed">
                The most transparent and fair coin flipping game on the Solana blockchain.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-yellow-400">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/demo" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Try Demo
                </Link>
                <Link href="/play" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Play Real
                </Link>
                <a href="#features" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Features
                </a>
                <a href="#how-it-works" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  How It Works
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-yellow-400">Community</h4>
              <div className="space-y-2">
                <a href="#" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Twitter
                </a>
                <a href="#" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Discord
                </a>
                <a href="#" className="block text-yellow-100/60 hover:text-yellow-400 transition text-sm">
                  Telegram
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="border-t border-yellow-500/20 pt-8 space-y-4">
            <div className="text-xs text-yellow-100/50 leading-relaxed space-y-2">
              <p>
                <strong className="text-yellow-400/80">Risk Warning:</strong> Coin flipping involves risk. 
                Only play with funds you can afford to lose. This platform is for entertainment purposes.
              </p>
              <p>
                <strong className="text-yellow-400/80">Age Restriction:</strong> You must be 18 years or older 
                to use this platform. By using this service, you confirm you meet the age requirement.
              </p>
              <p>
                <strong className="text-yellow-400/80">Legal Notice:</strong> Check your local laws regarding 
                online gaming. Some jurisdictions may restrict or prohibit such activities.
              </p>
              <p>
                <strong className="text-yellow-400/80">Smart Contract:</strong> All transactions are executed 
                through audited smart contracts on the Solana blockchain. Results are provably fair and verifiable.
              </p>
            </div>
            
            <div className="text-center text-sm text-yellow-100/50 pt-4">
              <p>© 2024 Solana Flip. All rights reserved. Play responsibly.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}