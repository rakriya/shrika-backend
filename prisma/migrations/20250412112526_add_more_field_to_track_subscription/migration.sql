/*
  Warnings:

  - You are about to drop the column `planId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `authAttempts` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidCount` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "planId",
ADD COLUMN     "authAttempts" INTEGER NOT NULL,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "paidCount" INTEGER NOT NULL,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "shortUrl" TEXT;
