/*
  Warnings:

  - You are about to drop the `AccountDeposit` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountBalanceType" AS ENUM ('WITHDRAW', 'DEPOSIT');

-- DropForeignKey
ALTER TABLE "AccountDeposit" DROP CONSTRAINT "AccountDeposit_userId_fkey";

-- DropTable
DROP TABLE "AccountDeposit";

-- DropEnum
DROP TYPE "AccountDepositType";

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AccountBalanceType" NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
