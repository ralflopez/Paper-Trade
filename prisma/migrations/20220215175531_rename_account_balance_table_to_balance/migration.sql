/*
  Warnings:

  - You are about to drop the `AccountBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('WITHDRAW', 'DEPOSIT');

-- DropForeignKey
ALTER TABLE "AccountBalance" DROP CONSTRAINT "AccountBalance_userId_fkey";

-- DropTable
DROP TABLE "AccountBalance";

-- DropEnum
DROP TYPE "AccountBalanceType";

-- CreateTable
CREATE TABLE "balance" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "BalanceType" NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
