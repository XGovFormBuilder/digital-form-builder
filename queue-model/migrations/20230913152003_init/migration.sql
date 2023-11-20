-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `webhook_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `data` VARCHAR(8192) NOT NULL,
    `error` VARCHAR(191) NULL,
    `return_reference` VARCHAR(191) NULL,
    `complete` BOOLEAN NOT NULL,
    `retry_counter` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
