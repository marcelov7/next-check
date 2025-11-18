-- AlterTable
ALTER TABLE `Equipamento` ADD COLUMN `tipoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TipoEquipamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TipoEquipamento_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ordem` INTEGER NULL,
    `obrigatorio` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Equipamento` ADD CONSTRAINT `Equipamento_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `TipoEquipamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckTemplate` ADD CONSTRAINT `CheckTemplate_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `TipoEquipamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

