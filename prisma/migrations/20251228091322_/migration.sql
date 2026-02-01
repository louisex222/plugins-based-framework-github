-- DropForeignKey
ALTER TABLE "chat_rooms" DROP CONSTRAINT "chat_rooms_createdById_fkey";

-- AlterTable
ALTER TABLE "chat_rooms" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "streamKey" DROP NOT NULL,
ALTER COLUMN "endedAt" SET DEFAULT CURRENT_TIMESTAMP;
