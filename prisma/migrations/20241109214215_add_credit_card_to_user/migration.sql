-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'UPI');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Pending', 'Ongoing', 'Completed', 'Canceled');

-- CreateTable
CREATE TABLE "User" (
    "userID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardNumber" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Rider" (
    "riderID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("riderID")
);

-- CreateTable
CREATE TABLE "Driver" (
    "driverID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'Inactive',
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "location" JSONB,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("driverID")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'Pending',
    "source" JSONB,
    "destination" JSONB,
    "riderID" INTEGER,
    "driverID" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tripID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_userID_key" ON "Rider"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userID_key" ON "Driver"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tripID_key" ON "Payment"("tripID");

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_riderID_fkey" FOREIGN KEY ("riderID") REFERENCES "Rider"("riderID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverID_fkey" FOREIGN KEY ("driverID") REFERENCES "Driver"("driverID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tripID_fkey" FOREIGN KEY ("tripID") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
