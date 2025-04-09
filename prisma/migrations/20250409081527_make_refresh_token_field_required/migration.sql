/*
  Warnings:

  - Made the column `expiresAt` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userAgent` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ipAddress` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "expiresAt" SET NOT NULL,
ALTER COLUMN "userAgent" SET NOT NULL,
ALTER COLUMN "ipAddress" SET NOT NULL;
