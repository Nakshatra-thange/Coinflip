"use client"

import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui"

export default function WalletButtons() {
  return (
    <div className="flex gap-3">
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  )
}
