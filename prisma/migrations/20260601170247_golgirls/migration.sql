-- CreateTable
CREATE TABLE `chamadas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turma_id` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chamada_id` INTEGER NOT NULL,
    `aluno_id` INTEGER NOT NULL,
    `presente` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `registros` ADD CONSTRAINT `registros_chamada_id_fkey` FOREIGN KEY (`chamada_id`) REFERENCES `chamadas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
