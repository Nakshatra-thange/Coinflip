"use client"

import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui"

export default function WalletHeader() {
  return (
    <div className="flex justify-end gap-4 p-4 border-b">
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  )
}
