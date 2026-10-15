-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BotType" AS ENUM ('SELL', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'FULFILLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('FROZEN', 'DEDUCT', 'REFUND', 'EXCHANGE_CREDIT', 'EXCHANGE_DEBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "characterName" TEXT,
    "balanceTt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "server" TEXT,
    "type" "BotType" NOT NULL,
    "mapHint" TEXT,
    "posHint" TEXT,
    "rateOverride" INTEGER,
    "dailyLimitTt" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "botTokenHash" TEXT,
    "lastHeartbeatAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL,
    "donGia" INTEGER NOT NULL,
    "maxQty" INTEGER NOT NULL DEFAULT 999,
    "maVp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotStock" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "bagQty" INTEGER NOT NULL DEFAULT 0,
    "chestQty" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalTt" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "kcAmount" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "ttAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "refId" TEXT,
    "botId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_characterName_key" ON "User"("characterName");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCode_code_key" ON "LinkCode"("code");

-- CreateIndex
CREATE INDEX "LinkCode_userId_idx" ON "LinkCode"("userId");

-- CreateIndex
CREATE INDEX "LinkCode_code_idx" ON "LinkCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_botTokenHash_key" ON "Bot"("botTokenHash");

-- CreateIndex
CREATE INDEX "BotStock_botId_idx" ON "BotStock"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "BotStock_botId_productId_key" ON "BotStock"("botId", "productId");

-- CreateIndex
CREATE INDEX "Order_botId_status_createdAt_idx" ON "Order"("botId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "ExchangeRecord_botId_createdAt_idx" ON "ExchangeRecord"("botId", "createdAt");

-- CreateIndex
CREATE INDEX "ExchangeRecord_userId_idx" ON "ExchangeRecord"("userId");

-- CreateIndex
CREATE INDEX "Ledger_userId_idx" ON "Ledger"("userId");

-- CreateIndex
CREATE INDEX "Ledger_botId_createdAt_idx" ON "Ledger"("botId", "createdAt");

-- AddForeignKey
ALTER TABLE "LinkCode" ADD CONSTRAINT "LinkCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotStock" ADD CONSTRAINT "BotStock_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRecord" ADD CONSTRAINT "ExchangeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRecord" ADD CONSTRAINT "ExchangeRecord_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
