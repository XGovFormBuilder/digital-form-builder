/*
  Warnings:

  - Made the column `webhook_url` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/

-- UpdateColumn
UPDATE `Submission` SET `webhook_url`='' WHERE `webhook_url` IS NULL;

-- AlterTable
ALTER TABLE `Submission` MODIFY `webhook_url` VARCHAR(191) NOT NULL;
