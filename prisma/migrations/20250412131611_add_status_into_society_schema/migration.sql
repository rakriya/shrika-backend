/*
  Warnings:

  - Added the required column `status` to the `Society` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "status" TEXT NOT NULL;
