-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "customPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isCustomPermissionsEnabled" BOOLEAN NOT NULL DEFAULT false;
