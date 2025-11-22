/*
  Warnings:

  - You are about to alter the column `status` on the `Parada` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `tipo` on the `Parada` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `Teste` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `Account` MODIFY `oauth_token_secret` VARCHAR(191) NULL,
    MODIFY `oauth_token` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Area` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `CheckTemplate` ADD COLUMN `tipoCampo` ENUM('status', 'texto', 'numero', 'temperatura') NOT NULL DEFAULT 'status',
    ADD COLUMN `unidade` VARCHAR(191) NULL,
    ADD COLUMN `valorMaximo` DOUBLE NULL,
    ADD COLUMN `valorMinimo` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Equipamento` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Parada` ADD COLUMN `areasConfig` JSON NULL,
    MODIFY `status` ENUM('em_andamento', 'concluida', 'cancelada') NOT NULL DEFAULT 'em_andamento',
    MODIFY `tipo` ENUM('preventiva', 'corretiva', 'emergencial') NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Teste` ADD COLUMN `checkTemplateId` INTEGER NULL,
    ADD COLUMN `evidenciaImagem` LONGTEXT NULL,
    ADD COLUMN `resolucaoImagem` LONGTEXT NULL,
    ADD COLUMN `resolucaoTexto` VARCHAR(191) NULL,
    MODIFY `status` ENUM('pendente', 'ok', 'problema', 'nao_aplica') NOT NULL DEFAULT 'pendente',
    MODIFY `observacoes` VARCHAR(191) NULL,
    MODIFY `problemaDescricao` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `ParadaArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paradaId` INTEGER NOT NULL,
    `areaId` INTEGER NOT NULL,
    `responsavelId` INTEGER NULL,
    `responsavelNome` VARCHAR(191) NULL,
    `equipeHabilitada` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ParadaArea_paradaId_idx`(`paradaId`),
    INDEX `ParadaArea_areaId_idx`(`areaId`),
    UNIQUE INDEX `ParadaArea_paradaId_areaId_key`(`paradaId`, `areaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParadaAreaMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paradaAreaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `setor` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParadaAreaEquip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paradaAreaId` INTEGER NOT NULL,
    `equipamentoId` INTEGER NOT NULL,

    UNIQUE INDEX `ParadaAreaEquip_paradaAreaId_equipamentoId_key`(`paradaAreaId`, `equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ParadaArea` ADD CONSTRAINT `ParadaArea_paradaId_fkey` FOREIGN KEY (`paradaId`) REFERENCES `Parada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParadaArea` ADD CONSTRAINT `ParadaArea_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParadaArea` ADD CONSTRAINT `ParadaArea_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParadaAreaMember` ADD CONSTRAINT `ParadaAreaMember_paradaAreaId_fkey` FOREIGN KEY (`paradaAreaId`) REFERENCES `ParadaArea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParadaAreaEquip` ADD CONSTRAINT `ParadaAreaEquip_paradaAreaId_fkey` FOREIGN KEY (`paradaAreaId`) REFERENCES `ParadaArea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParadaAreaEquip` ADD CONSTRAINT `ParadaAreaEquip_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `Equipamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teste` ADD CONSTRAINT `Teste_checkTemplateId_fkey` FOREIGN KEY (`checkTemplateId`) REFERENCES `CheckTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
