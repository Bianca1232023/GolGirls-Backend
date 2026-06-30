/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `alunos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `alunos` ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `password` VARCHAR(255) NULL,
    ADD COLUMN `reset_token` VARCHAR(255) NULL,
    ADD COLUMN `reset_token_expires` DATETIME(3) NULL,
    ADD COLUMN `set_password_token` VARCHAR(255) NULL,
    ADD COLUMN `set_password_token_expires` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `author_id` INTEGER NOT NULL,
    `author_role` ENUM('professor', 'admin') NOT NULL,
    `text` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `author_id` INTEGER NOT NULL,
    `author_role` ENUM('professor', 'admin') NOT NULL,
    `text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `alunos_email_key` ON `alunos`(`email`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
