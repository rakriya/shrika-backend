/*
  Warnings:

  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_memberId_fkey";

-- DropTable
DROP TABLE "Otp";

-- DropEnum
DROP TYPE "OTP_PURPOSE";

-- DropEnum
DROP TYPE "OTP_STATUS";
