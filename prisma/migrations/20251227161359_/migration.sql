/*
  Warnings:

  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN     "endedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Room";
