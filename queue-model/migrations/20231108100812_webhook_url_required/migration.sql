-- UpdateColumn
UPDATE `Submission` SET `webhook_url`='' WHERE `webhook_url` IS NULL;

-- AlterTable
ALTER TABLE `Submission` MODIFY `webhook_url` VARCHAR(191) NOT NULL;
