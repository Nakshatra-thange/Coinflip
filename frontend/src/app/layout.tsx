import "./globals.css"
import { SolanaProvider } from "@/components/solana-provider"
import WalletHeader from "@/components/wallet-header"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body>
        <SolanaProvider>
          <WalletHeader />
          <main>{children}</main>
        </SolanaProvider>
      </body>
    </html>
  )
}

