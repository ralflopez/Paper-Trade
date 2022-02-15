/*
  Warnings:

  - You are about to drop the column `boughtValue` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `value` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "boughtValue",
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;
