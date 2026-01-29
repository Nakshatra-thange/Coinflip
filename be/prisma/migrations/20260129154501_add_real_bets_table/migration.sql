-- CreateTable
CREATE TABLE "RealBet" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "betAmount" DOUBLE PRECISION NOT NULL,
    "result" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "txSignature" TEXT NOT NULL,
    "balanceAfter" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealBet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RealBet_txSignature_key" ON "RealBet"("txSignature");
