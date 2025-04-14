-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "isTrialUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndDate" TIMESTAMP(3);
