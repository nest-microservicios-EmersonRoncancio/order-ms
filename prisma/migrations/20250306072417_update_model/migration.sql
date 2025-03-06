/*
  Warnings:

  - The `paid` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
DROP COLUMN "paid",
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;
