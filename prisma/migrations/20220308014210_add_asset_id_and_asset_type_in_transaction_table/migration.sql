/*
  Warnings:

  - Added the required column `assetId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetType` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('FIAT', 'CRYPTO');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "assetType" "AssetType" NOT NULL;
