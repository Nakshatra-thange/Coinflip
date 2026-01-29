"use client"

import dynamic from "next/dynamic"

const WalletButtons = dynamic(
  () => import("./wallet-buttons"),
  { ssr: false }
)

export default function WalletHeader() {
  return (
    <div className="flex justify-end p-4 border-b">
      <WalletButtons />
    </div>
  )
}
