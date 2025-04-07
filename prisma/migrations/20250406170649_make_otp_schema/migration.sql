-- CreateEnum
CREATE TYPE "OTP_PURPOSE" AS ENUM ('login', 'reset_password');

-- CreateEnum
CREATE TYPE "OTP_STATUS" AS ENUM ('expired', 'used', 'unused');

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" "OTP_PURPOSE" NOT NULL,
    "status" "OTP_STATUS" NOT NULL DEFAULT 'unused',
    "phoneNumber" TEXT,
    "memberId" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Otp_phoneNumber_purpose_status_memberId_idx" ON "Otp"("phoneNumber", "purpose", "status", "memberId");

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
