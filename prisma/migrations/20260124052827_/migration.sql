/*
  Warnings:

  - You are about to drop the column `onlineCount` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN     "onlineCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "onlineCount";
