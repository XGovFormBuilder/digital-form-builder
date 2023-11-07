/*
  Warnings:

  - Made the column `webhook_url` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Submission` MODIFY `webhook_url` VARCHAR(191) NOT NULL;
