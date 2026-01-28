/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "DemoUser" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoBet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betAmount" DECIMAL(65,30) NOT NULL,
    "choice" TEXT NOT NULL,
    "result" TEXT,
    "payout" DECIMAL(65,30),
    "txSignature" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoUser_walletAddress_key" ON "DemoUser"("walletAddress");

-- AddForeignKey
ALTER TABLE "DemoBet" ADD CONSTRAINT "DemoBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DemoUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
