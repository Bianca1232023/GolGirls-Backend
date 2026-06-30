-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expires` DATETIME(3) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expires` DATETIME(3) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `professors_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turmas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `escola_id` INTEGER NULL,
    `nucleo_id` INTEGER NULL,
    `capacidade` TINYINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nucleos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `localizacao` VARCHAR(255) NULL,

    UNIQUE INDEX `nucleos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escolas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `endereco` VARCHAR(255) NULL,

    UNIQUE INDEX `escolas_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alunos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `matricula` VARCHAR(100) NOT NULL,
    `nucleo_id` INTEGER NULL,
    `idade` TINYINT UNSIGNED NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dia_aula` VARCHAR(50) NULL,
    `bairro` VARCHAR(150) NOT NULL,
    `turma_id` INTEGER NULL,
    `escola_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `role` ENUM('professor', 'admin') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professor_turmas` (
    `professor_id` INTEGER NOT NULL,
    `turma_id` INTEGER NOT NULL,

    PRIMARY KEY (`professor_id`, `turma_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `turmas` ADD CONSTRAINT `turmas_escola_id_fkey` FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turmas` ADD CONSTRAINT `turmas_nucleo_id_fkey` FOREIGN KEY (`nucleo_id`) REFERENCES `nucleos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alunos` ADD CONSTRAINT `alunos_turma_id_fkey` FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alunos` ADD CONSTRAINT `alunos_nucleo_id_fkey` FOREIGN KEY (`nucleo_id`) REFERENCES `nucleos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alunos` ADD CONSTRAINT `alunos_escola_id_fkey` FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professor_turmas` ADD CONSTRAINT `professor_turmas_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `professors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professor_turmas` ADD CONSTRAINT `professor_turmas_turma_id_fkey` FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
