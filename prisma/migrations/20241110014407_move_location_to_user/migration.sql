/*
  Warnings:

  - You are about to drop the column `location` on the `Driver` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "location";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "location" JSONB;
