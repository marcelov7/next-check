-- SQL para criar tabelas normalizadas para configurar responsáveis por área
-- Execute no seu MySQL (faça backup antes)

CREATE TABLE IF NOT EXISTS `ParadaArea` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `paradaId` INT NOT NULL,
  `areaId` INT NOT NULL,
  `responsavelId` INT NULL,
  `responsavelNome` VARCHAR(191) NULL,
  `equipeHabilitada` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `parada_area_unique` (`paradaId`, `areaId`),
  KEY `idx_paradaId` (`paradaId`),
  KEY `idx_areaId` (`areaId`),
  CONSTRAINT `fk_paradaarea_parada` FOREIGN KEY (`paradaId`) REFERENCES `Parada`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_paradaarea_area` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ParadaAreaMember` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `paradaAreaId` INT NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `setor` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_paradaAreaId_member` (`paradaAreaId`),
  CONSTRAINT `fk_pam_paradaarea` FOREIGN KEY (`paradaAreaId`) REFERENCES `ParadaArea`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ParadaAreaEquip` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `paradaAreaId` INT NOT NULL,
  `equipamentoId` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paradaArea_equip_unique` (`paradaAreaId`, `equipamentoId`),
  KEY `idx_paradaAreaId_equip` (`paradaAreaId`),
  CONSTRAINT `fk_pae_paradaarea` FOREIGN KEY (`paradaAreaId`) REFERENCES `ParadaArea`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pae_equip` FOREIGN KEY (`equipamentoId`) REFERENCES `Equipamento`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opcional: adicionar FK para responsavelId apontando para User(id)
ALTER TABLE `ParadaArea`
  ADD COLUMN IF NOT EXISTS `responsavelId` INT NULL;
-- Caso queira adicionar a constraint (comente se não quiser):
-- ALTER TABLE `ParadaArea` ADD CONSTRAINT `fk_paradaarea_user` FOREIGN KEY (`responsavelId`) REFERENCES `User`(`id`);

