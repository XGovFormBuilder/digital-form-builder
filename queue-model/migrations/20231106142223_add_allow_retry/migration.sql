/*
  Warnings:

  - Added the required column `allow_retry` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Submission` ADD COLUMN `allow_retry` BOOLEAN NOT NULL;
