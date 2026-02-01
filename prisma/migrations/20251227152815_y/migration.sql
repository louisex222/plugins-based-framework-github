/*
  Warnings:

  - You are about to drop the column `username` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `chat_rooms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `chat_rooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `chat_rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `chat_rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streamKey` to the `chat_rooms` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `gift` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GiftType" AS ENUM ('HEART', 'CAR', 'DIAMOND');

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" UUID NOT NULL,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "streamKey" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "gift" DROP COLUMN "type",
ADD COLUMN     "type" "GiftType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_slug_key" ON "chat_rooms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
