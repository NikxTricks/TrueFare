/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_userID_fkey";

-- DropForeignKey
ALTER TABLE "Rider" DROP CONSTRAINT "Rider_userID_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_driverID_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_riderID_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "driverStatus" "DriverStatus",
ADD COLUMN     "isDriver" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "cardNumber" DROP NOT NULL;

-- DropTable
DROP TABLE "Driver";

-- DropTable
DROP TABLE "Rider";

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_riderID_fkey" FOREIGN KEY ("riderID") REFERENCES "User"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverID_fkey" FOREIGN KEY ("driverID") REFERENCES "User"("userID") ON DELETE SET NULL ON UPDATE CASCADE;
