-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.8.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para app_esperanza_viva
DROP DATABASE IF EXISTS `app_esperanza_viva`;
CREATE DATABASE IF NOT EXISTS `app_esperanza_viva` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `app_esperanza_viva`;

-- Volcando estructura para tabla app_esperanza_viva.personas
DROP TABLE IF EXISTS `personas`;
CREATE TABLE IF NOT EXISTS `personas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `dni` varchar(15) NOT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  `nombres` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.personas: ~50 rows (aproximadamente)
INSERT INTO `personas` (`id`, `apellidos`, `correo_electronico`, `dni`, `domicilio`, `nombres`, `telefono`) VALUES
	(1, '', '', '', '', '', ''),
	(2, '', '', '', '', '', ''),
	(3, '', '', '', '', '', ''),
	(4, '', '', '', '', '', ''),
	(5, '', '', '', '', '', ''),
	(6, '', '', '', '', '', ''),
	(7, '', '', '', '', '', ''),
	(8, '', '', '', '', '', ''),
	(9, 'Soto Icarayme', '', '', 'av. Las intimpas', 'Jesilin', ''),
	(10, 'Quispe Maucaylle', 'David@gmail.com', '74555592', 'av. Julio C. tello', 'David', '966495094'),
	(11, 'Soto Icarayme', 'jesilin@gmail.com', '12345678', 'av. Las intimpas', 'Jesilin', '966495094'),
	(12, 'quispe maucaylle', 'David@gmail.com', '74555592', 'av. Julio C. tello', 'david', '966495094'),
	(13, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(14, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(15, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(16, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(17, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(18, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(19, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(20, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(21, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(22, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(23, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(24, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(25, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(26, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(27, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(28, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(29, 'Gomez Torres', 'maria.gomez@email.com', '88888888', 'Calle Union 456', 'Maria Elena', '912345678'),
	(30, 'Perez Rodriguez', 'juan.perez@email.com', '77777777', 'Av. Esperanza 123', 'Juan Carlos', '987654321'),
	(31, 'Soto Icarayme', 'jesilin@gmail.com', '12345678', 'av. Las Intimpas', 'Jesilin', '966495094'),
	(32, 'quispe maucaylle', 'david@gmail.com', '74555592', 'av. Julio C. Tello', 'david', '966495094'),
	(33, 'perez sequieros', '234567@unamba.edu.pe', '98765432', 'av las gardenias', 'maria ', '098765432'),
	(34, 'coaquira leo', '2345687@unamba.edu.pe', '75973289', 'av cahuide sn', 'rut nory', '98765432'),
	(35, 'quispe maucaylle', 'maria@gmail.com', '12345678', 'av las gardenias', 'daviasdadsad', '966495094'),
	(36, 'quispe maucaylle', 'juan@gmail.com', '74555591', 'av. Julio C. Tello', 'daviddd', '966495094'),
	(37, 'Cruz LLicahua', 'Yamilet@gmail.com', '12345678', 'av. Canada', 'Yamilet', '966495094'),
	(38, 'Rayme Pimentel', 'yerymay@gmail.com', '74555592', 'av. Canada', 'Yerymay', '966495094'),
	(39, 'Coaquira Leo', 'rut@gmail.com', '74555599', 'av. Canada', 'Rut', '966495099'),
	(40, 'Perez', 'juan1@gmail.com', '74555591', 'av. Julio C. Tello', 'Juan ', '966495094'),
	(41, 'qusdadsaylle', 'rut@gmail.com', '74555599', 'av. Canada', 'sddasd', '966495092'),
	(42, 'quispe maucaylle', '2345687@unamba.edu.pe', '74555592', 'av. Julio C. Tello', 'david', '966495094'),
	(43, 'Cruz LLicahua', 'Yamilet@gmail.com', '12345688', 'av. Canada', 'Yamilet', '966495094'),
	(44, 'quispe maucaylle', 'david@gmail.com', '74555592', 'av. Julio C. Tello', 'david', '966495094'),
	(45, 'lara perez', '231169@unamba.edu.pe', '89765432', 'av lo champiñones', 'carmensita', '435678909'),
	(46, 'cruz llicahua', '231170@unamba.edu.pe', '12345678', 'av los pinitos', 'jamileth ', '987654321'),
	(47, 'qusdsdasda', 'dsda@unamba.edu.pe', '12345678', 'av las gardenias', 'sadsds', '966495094'),
	(48, 'asdasdasd', 'davidsadsd@gmail.com', '12345675', 'av. Julio C. Tello', 'sdasdasd', '966495094'),
	(49, 'Rios Ccarapa', 'jhon@gmail.com', '72677254', 'lima pata', 'Jhon Antony', '966455594'),
	(50, 'Santos Huaman', 'jhoel@gmail.com', '71084182', 'av. fonabi', 'Jhoel', '966495044');

-- Volcando estructura para tabla app_esperanza_viva.solicitudes
DROP TABLE IF EXISTS `solicitudes`;
CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `estado` varchar(255) DEFAULT NULL,
  `fecha_presentacion` datetime(6) DEFAULT NULL,
  `hechos` text DEFAULT NULL,
  `materia_conciliable` varchar(255) DEFAULT NULL,
  `numero_expediente` varchar(255) DEFAULT NULL,
  `pretension` text DEFAULT NULL,
  `invitado_id` bigint(20) DEFAULT NULL,
  `solicitante_id` bigint(20) DEFAULT NULL,
  `dni_archivo_url` varchar(255) DEFAULT NULL,
  `pruebas_archivo_url` varchar(255) DEFAULT NULL,
  `firma_archivo_url` varchar(255) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nsc320da2826bdguyjbcidabi` (`numero_expediente`),
  KEY `FKnx29kewjsix08a31l38r6u9qm` (`invitado_id`),
  KEY `FKtmtdtohlq556172hsglu76oe8` (`solicitante_id`),
  CONSTRAINT `FKnx29kewjsix08a31l38r6u9qm` FOREIGN KEY (`invitado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FKtmtdtohlq556172hsglu76oe8` FOREIGN KEY (`solicitante_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.solicitudes: ~25 rows (aproximadamente)
INSERT INTO `solicitudes` (`id`, `estado`, `fecha_presentacion`, `hechos`, `materia_conciliable`, `numero_expediente`, `pretension`, `invitado_id`, `solicitante_id`, `dni_archivo_url`, `pruebas_archivo_url`, `firma_archivo_url`, `observacion`) VALUES
	(1, 'PENDIENTE', '2025-12-17 01:15:39.048026', '', '', 'EXP-2025-000001', '', 1, 2, NULL, NULL, NULL, NULL),
	(2, 'PENDIENTE', '2025-12-17 01:16:07.479252', '', '', 'EXP-2025-000002', '', 3, 4, NULL, NULL, NULL, NULL),
	(3, 'PENDIENTE', '2025-12-17 01:24:08.613483', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000003', 'Pretensión pendiente', 5, 6, NULL, NULL, NULL, NULL),
	(4, 'PENDIENTE', '2025-12-17 01:24:12.297553', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000004', 'Pretensión pendiente', 7, 8, NULL, NULL, NULL, NULL),
	(5, 'PENDIENTE', '2025-12-17 01:25:35.505603', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000005', 'Pretensión pendiente', 9, 10, NULL, NULL, NULL, NULL),
	(6, 'PENDIENTE', '2025-12-17 01:29:24.057457', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000006', 'Pretensión pendiente', 11, 12, NULL, NULL, NULL, NULL),
	(7, 'PENDIENTE', '2025-12-17 17:50:18.229047', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000007', 'Que se realice el pago total de la deuda pendiente.', 13, 14, NULL, NULL, NULL, NULL),
	(8, 'PENDIENTE', '2025-12-17 17:50:58.630640', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000008', 'Que se realice el pago total de la deuda pendiente.', 15, 16, NULL, NULL, NULL, NULL),
	(9, 'PENDIENTE', '2025-12-17 17:51:07.024068', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000009', 'Que se realice el pago total de la deuda pendiente.', 17, 18, NULL, NULL, NULL, NULL),
	(10, 'PENDIENTE', '2025-12-17 18:02:47.473483', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000010', 'Que se realice el pago total de la deuda pendiente.', 19, 20, NULL, NULL, NULL, NULL),
	(11, 'PENDIENTE', '2025-12-17 18:09:52.568499', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000011', 'Que se realice el pago total de la deuda pendiente.', 21, 22, NULL, NULL, NULL, NULL),
	(12, 'PENDIENTE', '2025-12-17 18:17:54.212536', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000012', 'Que se realice el pago total de la deuda pendiente.', 23, 24, NULL, NULL, NULL, NULL),
	(13, 'PENDIENTE', '2025-12-17 18:23:28.092850', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000013', 'Que se realice el pago total de la deuda pendiente.', 25, 26, NULL, NULL, NULL, NULL),
	(14, 'PENDIENTE', '2025-12-17 18:41:35.751417', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000014', 'Que se realice el pago total de la deuda pendiente.', 27, 28, NULL, NULL, NULL, NULL),
	(15, 'PENDIENTE', '2025-12-17 19:06:02.555022', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000015', 'Que se realice el pago total de la deuda pendiente.', 29, 30, NULL, NULL, NULL, NULL),
	(16, 'PENDIENTE', '2025-12-17 19:36:17.081557', 'ssdsds', 'Derecho de Familia', 'EXP-2025-000016', 'asdsdsd', 31, 32, NULL, NULL, NULL, NULL),
	(17, 'PENDIENTE', '2025-12-17 19:38:49.751027', 'quiero 1202', 'Derecho Laboral', 'EXP-2025-000017', 'derecho laboral', 33, 34, NULL, NULL, NULL, NULL),
	(18, 'PENDIENTE', '2025-12-17 19:54:55.185642', 'asdaaaaaaaa', '', 'EXP-2025-000018', 'ssssssssssssssssssss', 35, 36, NULL, NULL, NULL, NULL),
	(19, 'PENDIENTE', '2025-12-17 22:25:51.627774', 'pelea en la sociedad que viven ', 'Derecho Civil', 'EXP-2025-000019', 'quiero que se resuelva y por perdida de tiempo quiero 10000 soles', 37, 38, '0310b3bd-4dd2-4460-bcad-3961a25ca444_Captura de pantalla 2025-10-07 183150.png', 'f6d91d1d-af96-42d9-b779-e04f3b378778_Captura de pantalla 2025-10-07 183906.png', '751d1165-6298-4a8e-a16c-395799ea657d_Captura de pantalla 2025-10-07 184542.png', NULL),
	(20, 'PENDIENTE', '2025-12-19 16:13:41.848813', 'sdsdsda', 'Derecho de Familia', 'EXP-2025-000020', 'sdasdsa', 39, 40, 'c251d0ee-e8a5-451a-a2e9-7dc7547ed60a_pasted.txt', NULL, NULL, NULL),
	(21, 'PENDIENTE', '2025-12-19 16:35:30.880097', 'asdasdasdas  dsads a a sd', 'Derecho de Familia', 'EXP-2025-000021', 'quiero plata', 41, 42, '7f5b2022-2ef2-42b3-a58d-7c6004d336bf_dni02.jpg', NULL, '869b4ee8-60ae-4ace-85ba-a6a9db4a8a4e_Solicitud_74555592.pdf', NULL),
	(22, 'PENDIENTE', '2025-12-19 17:12:31.310907', 'no complio los horarios de trabajo de la empresa', 'Derecho Laboral', 'EXP-2025-000022', 'que pague los dias que no cumplio la hora', 43, 44, '3543ef97-1a4b-4b2d-864b-271bc7794b03_dni02.jpg', NULL, '5b697993-933e-4de0-9fe0-c57f2a37db28_Solicitud_74555592.pdf', NULL),
	(23, 'PENDIENTE', '2025-12-19 18:26:02.749599', 'me pego en la cara con un puñetazo', 'Derecho de Familia', 'EXP-2025-000023', 'solicito 20.000 soles para cirujia', 45, 46, '4b1f4f69-dd53-4437-b992-c431888bde58_dni01.jpg', '663003b4-5d62-4400-a957-83fc54723a37_Tipos de sistemas archivos.pdf', '14af3434-1010-4210-b3bd-eecba8f27bc3_Solicitud_74555592.pdf', NULL),
	(24, 'PENDIENTE', '2025-12-19 18:29:36.760032', 'asdsddsadasd  dasda a sd', 'Derecho de Familia', 'EXP-2025-000024', 'asdadsdasaf', 47, 48, '6f3f8086-6f1b-4df4-9bc7-0d8899004dcd_dni02.jpg', '18ebd1d4-8dd8-40f0-abd5-54e830bbb77d_pasted.txt', '4be77ab7-705d-4c61-aa08-bd62ed2a8e0c_Formato_A_12345675.pdf', NULL),
	(25, 'PENDIENTE', '2025-12-19 18:57:58.065744', 'imvacion de terreno en fonabi', 'Derecho Civil', 'EXP-2025-000025', 'desalojo inmediato', 49, 50, 'cc9207e9-217b-47de-b51d-6316dec94d61_dni02.jpg', '8c6536b6-a5dd-4530-bdcd-5e20858835d0_Tipos de sistemas archivos.pdf', 'f3b42c9e-daf9-41e2-806e-8eb1791b6bb5_Formato_A_71084182 (1).pdf', NULL);

-- Volcando estructura para tabla app_esperanza_viva.usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `estado` bit(1) NOT NULL,
  `fecha_registro` datetime(6) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_m2dvbwfge291euvmk6vkkocao` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuarios: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
