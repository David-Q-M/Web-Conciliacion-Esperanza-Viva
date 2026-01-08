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
CREATE DATABASE IF NOT EXISTS `app_esperanza_viva` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `app_esperanza_viva`;

-- Volcando estructura para tabla app_esperanza_viva.audiencias
CREATE TABLE IF NOT EXISTS `audiencias` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `solicitud_id` bigint(20) NOT NULL,
  `fecha_audiencia` date NOT NULL,
  `hora_audiencia` time NOT NULL,
  `lugar` varchar(255) DEFAULT 'Centro de Conciliación Esperanza Viva',
  `asistencia_solicitante` tinyint(1) DEFAULT 0,
  `asistencia_invitado` tinyint(1) DEFAULT 0,
  `resultado_tipo` varchar(50) DEFAULT NULL,
  `resultado_detalle` text DEFAULT NULL,
  `abogado_verificador_id` int(11) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_audiencia_solicitud` (`solicitud_id`),
  KEY `FK_audiencia_abogado` (`abogado_verificador_id`),
  CONSTRAINT `FK_audiencia_abogado` FOREIGN KEY (`abogado_verificador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_audiencia_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.audiencias: ~0 rows (aproximadamente)

-- Volcando estructura para tabla app_esperanza_viva.audiencia_clausulas
CREATE TABLE IF NOT EXISTS `audiencia_clausulas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `audiencia_id` bigint(20) NOT NULL,
  `orden` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_clausula_audiencia` (`audiencia_id`),
  CONSTRAINT `FK_clausula_audiencia` FOREIGN KEY (`audiencia_id`) REFERENCES `audiencias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.audiencia_clausulas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla app_esperanza_viva.auditoria
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `usuario_nombre` varchar(150) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `expediente_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.auditoria: ~63 rows (aproximadamente)
INSERT INTO `auditoria` (`id`, `fecha_hora`, `usuario_nombre`, `accion`, `detalles`, `expediente_id`) VALUES
	(1, '2025-12-28 11:31:00', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(2, '2025-12-28 11:42:50', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(3, '2025-12-28 11:49:21', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(4, '2025-12-28 11:49:42', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(5, '2025-12-28 11:59:27', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(6, '2025-12-28 11:59:53', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(7, '2025-12-28 12:00:33', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(8, '2025-12-28 12:05:58', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(9, '2025-12-28 12:06:58', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut', NULL),
	(10, '2025-12-28 12:07:08', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(11, '2025-12-28 12:07:22', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(12, '2025-12-28 12:12:31', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(13, '2025-12-28 13:20:22', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(14, '2025-12-28 13:21:03', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(15, '2025-12-28 13:25:38', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(16, '2025-12-28 13:26:51', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(17, '2025-12-28 13:32:36', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(18, '2025-12-28 13:45:41', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(19, '2025-12-28 14:01:55', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(20, '2025-12-28 14:39:49', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(21, '2025-12-28 14:40:36', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(22, '2025-12-28 14:40:56', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(23, '2025-12-28 14:44:44', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(24, '2025-12-28 14:46:14', 'Administrador', 'REGISTRO', 'Se registró nuevo personal: directorr (DIRECTOR)', NULL),
	(25, '2025-12-28 14:46:35', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(26, '2025-12-28 14:46:49', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(27, '2025-12-28 14:49:23', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(28, '2025-12-28 14:52:55', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(29, '2025-12-28 15:03:49', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(30, '2025-12-28 15:14:05', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(31, '2025-12-28 15:14:26', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(32, '2025-12-28 15:18:12', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(33, '2025-12-28 16:34:44', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(34, '2025-12-28 16:41:56', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(35, '2025-12-28 17:06:07', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(36, '2025-12-28 17:08:06', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: director', NULL),
	(37, '2025-12-28 17:08:15', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut', NULL),
	(38, '2025-12-28 17:08:22', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(39, '2025-12-28 17:15:44', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(40, '2025-12-28 18:07:08', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(41, '2025-12-28 18:10:07', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(42, '2025-12-28 18:14:01', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(43, '2025-12-28 18:32:28', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(44, '2025-12-28 18:44:27', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(45, '2025-12-28 18:44:38', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(46, '2025-12-28 18:47:50', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(47, '2025-12-28 19:12:01', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(48, '2025-12-28 19:12:30', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(49, '2025-12-28 19:13:33', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(50, '2025-12-29 12:52:08', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(51, '2025-12-29 12:57:53', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(52, '2026-01-05 00:25:04', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(53, '2026-01-05 00:25:27', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(54, '2026-01-05 01:32:21', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(55, '2026-01-05 01:33:04', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(56, '2026-01-05 01:33:17', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(57, '2026-01-05 01:33:57', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(58, '2026-01-05 01:36:41', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(59, '2026-01-05 01:36:50', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(60, '2026-01-05 01:44:38', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(61, '2026-01-05 01:57:39', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(62, '2026-01-05 01:58:27', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(63, '2026-01-05 02:00:34', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL);

-- Volcando estructura para tabla app_esperanza_viva.configuracion_sistema
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `categoria` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.configuracion_sistema: ~6 rows (aproximadamente)
INSERT INTO `configuracion_sistema` (`id`, `clave`, `valor`, `categoria`) VALUES
	(1, 'estado_1', 'Pendiente', 'ESTADO'),
	(2, 'estado_2', 'Asignado', 'ESTADO'),
	(3, 'estado_3', 'Finalizado', 'ESTADO'),
	(4, 'materia_1', 'Familiar', 'MATERIA'),
	(5, 'materia_2', 'Civil', 'MATERIA'),
	(6, 'motivo_rechazo_1', 'No cumple requisitos', 'RECHAZO');

-- Volcando estructura para tabla app_esperanza_viva.personas
CREATE TABLE IF NOT EXISTS `personas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  `nombres` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.personas: ~63 rows (aproximadamente)
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
	(50, 'Santos Huaman', 'jhoel@gmail.com', '71084182', 'av. fonabi', 'Jhoel', '966495044'),
	(51, 'rrrrrrrrr', 'ejemplo@gmail.com', '11111111', 'asssssssss', 'rrrrrrrrrr', '1112222222222222222'),
	(52, 'sdsdsad', 'ejemplo@gmail.com', '12222251', '21241222323', 'asasffsfdddddd', '933333333'),
	(53, 'sdsaddsad', 'ejemplo@gmail.com', '11121222', 'aaaaaaaaa', 'asdada', '923422355'),
	(54, 'rrrrrrrrr', 'ejemplo@gmail.com', '11111111', 'asssssssss', 'rrrrrrrrrr', '1112222222222222222'),
	(55, 'sdsdsad', 'ejemplo@gmail.com', '12222251', '21241222323', 'asasffsfdddddd', '933333333'),
	(56, 'sdsaddsad', 'ejemplo@gmail.com', '11121222', 'aaaaaaaaa', 'asdada', '923422355'),
	(58, 'rrrrrrrrrasds', 'ejemplo@gmail.com', '11222222', 'asssssssss', 'rrrrrrrrrrsdasd', '123456789'),
	(59, 'dsdsd', 'ejemplo@gmail.com', '12222251', '2ads1241222323', 'aaaaaddsads', '933333333'),
	(62, 'sdadsadsad', 'ejemplo@gmail.com', '22222222', 'awdsasds', 'asdasdasdsasdsd', '111111111'),
	(63, 'quispe maucaylle', '234567@unamba.edu.pe', '66666666', 'av. Canada', 'david', '966495094'),
	(64, 'Chacmana', '24237s@unamba.edu.pe', '77777777', 'av. Julio C. Tello', 'Emerson', '999999999'),
	(65, 'quispe maucaylle', '234567@unamba.edu.pe', '74555522', 'lima pata', 'ffe', '966495094'),
	(66, 'quispe maucaylle', 'david@gmail.com', '74525592', 'av. Canada', 'david', '966495094');

-- Volcando estructura para tabla app_esperanza_viva.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.roles: ~0 rows (aproximadamente)

-- Volcando estructura para tabla app_esperanza_viva.solicitudes
CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `estado` varchar(255) DEFAULT NULL,
  `fecha_presentacion` datetime(6) DEFAULT NULL,
  `hechos` text DEFAULT NULL,
  `materia_conciliable` varchar(255) DEFAULT NULL,
  `numero_expediente` varchar(255) DEFAULT NULL,
  `pretension` text DEFAULT NULL,
  `otras_personas_alimentario` text DEFAULT NULL,
  `invitado_id` bigint(20) DEFAULT NULL,
  `solicitante_id` bigint(20) DEFAULT NULL,
  `dni_archivo_url` varchar(255) DEFAULT NULL,
  `pruebas_archivo_url` varchar(255) DEFAULT NULL,
  `firma_archivo_url` varchar(255) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `apoderado_id` bigint(20) DEFAULT NULL,
  `sub_materia` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nsc320da2826bdguyjbcidabi` (`numero_expediente`),
  KEY `FKnx29kewjsix08a31l38r6u9qm` (`invitado_id`),
  KEY `FKtmtdtohlq556172hsglu76oe8` (`solicitante_id`),
  KEY `apoderado_id` (`apoderado_id`),
  CONSTRAINT `FKnx29kewjsix08a31l38r6u9qm` FOREIGN KEY (`invitado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FKtmtdtohlq556172hsglu76oe8` FOREIGN KEY (`solicitante_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`apoderado_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.solicitudes: ~30 rows (aproximadamente)
INSERT INTO `solicitudes` (`id`, `estado`, `fecha_presentacion`, `hechos`, `materia_conciliable`, `numero_expediente`, `pretension`, `otras_personas_alimentario`, `invitado_id`, `solicitante_id`, `dni_archivo_url`, `pruebas_archivo_url`, `firma_archivo_url`, `observacion`, `apoderado_id`, `sub_materia`) VALUES
	(1, 'PENDIENTE', '2025-12-17 01:15:39.048026', '', '', 'EXP-2025-000001', '', NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL),
	(2, 'PENDIENTE', '2025-12-17 01:16:07.479252', '', '', 'EXP-2025-000002', '', NULL, 3, 4, NULL, NULL, NULL, NULL, NULL, NULL),
	(3, 'PENDIENTE', '2025-12-17 01:24:08.613483', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000003', 'Pretensión pendiente', NULL, 5, 6, NULL, NULL, NULL, NULL, NULL, NULL),
	(4, 'PENDIENTE', '2025-12-17 01:24:12.297553', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000004', 'Pretensión pendiente', NULL, 7, 8, NULL, NULL, NULL, NULL, NULL, NULL),
	(5, 'PENDIENTE', '2025-12-17 01:25:35.505603', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000005', 'Pretensión pendiente', NULL, 9, 10, NULL, NULL, NULL, NULL, NULL, NULL),
	(6, 'PENDIENTE', '2025-12-17 01:29:24.057457', 'Descripción pendiente', 'Derecho Civil', 'EXP-2025-000006', 'Pretensión pendiente', NULL, 11, 12, NULL, NULL, NULL, NULL, NULL, NULL),
	(7, 'PENDIENTE', '2025-12-17 17:50:18.229047', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000007', 'Que se realice el pago total de la deuda pendiente.', NULL, 13, 14, NULL, NULL, NULL, NULL, NULL, NULL),
	(8, 'PENDIENTE', '2025-12-17 17:50:58.630640', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000008', 'Que se realice el pago total de la deuda pendiente.', NULL, 15, 16, NULL, NULL, NULL, NULL, NULL, NULL),
	(9, 'PENDIENTE', '2025-12-17 17:51:07.024068', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000009', 'Que se realice el pago total de la deuda pendiente.', NULL, 17, 18, NULL, NULL, NULL, NULL, NULL, NULL),
	(10, 'PENDIENTE', '2025-12-17 18:02:47.473483', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000010', 'Que se realice el pago total de la deuda pendiente.', NULL, 19, 20, NULL, NULL, NULL, NULL, NULL, NULL),
	(11, 'PENDIENTE', '2025-12-17 18:09:52.568499', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000011', 'Que se realice el pago total de la deuda pendiente.', NULL, 21, 22, NULL, NULL, NULL, NULL, NULL, NULL),
	(12, 'PENDIENTE', '2025-12-17 18:17:54.212536', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000012', 'Que se realice el pago total de la deuda pendiente.', NULL, 23, 24, NULL, NULL, NULL, NULL, NULL, NULL),
	(13, 'PENDIENTE', '2025-12-17 18:23:28.092850', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000013', 'Que se realice el pago total de la deuda pendiente.', NULL, 25, 26, NULL, NULL, NULL, NULL, NULL, NULL),
	(14, 'PENDIENTE', '2025-12-17 18:41:35.751417', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000014', 'Que se realice el pago total de la deuda pendiente.', NULL, 27, 28, NULL, NULL, NULL, NULL, NULL, NULL),
	(15, 'PENDIENTE', '2025-12-17 19:06:02.555022', 'El invitado no ha cumplido con el pago acordado en el contrato de fecha 15/10/2024.', 'Derecho Civil - Incumplimiento de Contrato', 'EXP-2025-000015', 'Que se realice el pago total de la deuda pendiente.', NULL, 29, 30, NULL, NULL, NULL, NULL, NULL, NULL),
	(16, 'PENDIENTE', '2025-12-17 19:36:17.081557', 'ssdsds', 'Derecho de Familia', 'EXP-2025-000016', 'asdsdsd', NULL, 31, 32, NULL, NULL, NULL, NULL, NULL, NULL),
	(17, 'PENDIENTE', '2025-12-17 19:38:49.751027', 'quiero 1202', 'Derecho Laboral', 'EXP-2025-000017', 'derecho laboral', NULL, 33, 34, NULL, NULL, NULL, NULL, NULL, NULL),
	(18, 'PENDIENTE', '2025-12-17 19:54:55.185642', 'asdaaaaaaaa', '', 'EXP-2025-000018', 'ssssssssssssssssssss', NULL, 35, 36, NULL, NULL, NULL, NULL, NULL, NULL),
	(19, 'PENDIENTE', '2025-12-17 22:25:51.627774', 'pelea en la sociedad que viven ', 'Derecho Civil', 'EXP-2025-000019', 'quiero que se resuelva y por perdida de tiempo quiero 10000 soles', NULL, 37, 38, '0310b3bd-4dd2-4460-bcad-3961a25ca444_Captura de pantalla 2025-10-07 183150.png', 'f6d91d1d-af96-42d9-b779-e04f3b378778_Captura de pantalla 2025-10-07 183906.png', '751d1165-6298-4a8e-a16c-395799ea657d_Captura de pantalla 2025-10-07 184542.png', NULL, NULL, NULL),
	(20, 'PENDIENTE', '2025-12-19 16:13:41.848813', 'sdsdsda', 'Derecho de Familia', 'EXP-2025-000020', 'sdasdsa', NULL, 39, 40, 'c251d0ee-e8a5-451a-a2e9-7dc7547ed60a_pasted.txt', NULL, NULL, NULL, NULL, NULL),
	(21, 'PENDIENTE', '2025-12-19 16:35:30.880097', 'asdasdasdas  dsads a a sd', 'Derecho de Familia', 'EXP-2025-000021', 'quiero plata', NULL, 41, 42, '7f5b2022-2ef2-42b3-a58d-7c6004d336bf_dni02.jpg', NULL, '869b4ee8-60ae-4ace-85ba-a6a9db4a8a4e_Solicitud_74555592.pdf', NULL, NULL, NULL),
	(22, 'PENDIENTE', '2025-12-19 17:12:31.310907', 'no complio los horarios de trabajo de la empresa', 'Derecho Laboral', 'EXP-2025-000022', 'que pague los dias que no cumplio la hora', NULL, 43, 44, '3543ef97-1a4b-4b2d-864b-271bc7794b03_dni02.jpg', NULL, '5b697993-933e-4de0-9fe0-c57f2a37db28_Solicitud_74555592.pdf', NULL, NULL, NULL),
	(23, 'PENDIENTE', '2025-12-19 18:26:02.749599', 'me pego en la cara con un puñetazo', 'Derecho de Familia', 'EXP-2025-000023', 'solicito 20.000 soles para cirujia', NULL, 45, 46, '4b1f4f69-dd53-4437-b992-c431888bde58_dni01.jpg', '663003b4-5d62-4400-a957-83fc54723a37_Tipos de sistemas archivos.pdf', '14af3434-1010-4210-b3bd-eecba8f27bc3_Solicitud_74555592.pdf', NULL, NULL, NULL),
	(24, 'PENDIENTE', '2025-12-19 18:29:36.760032', 'asdsddsadasd  dasda a sd', 'Derecho de Familia', 'EXP-2025-000024', 'asdadsdasaf', NULL, 47, 48, '6f3f8086-6f1b-4df4-9bc7-0d8899004dcd_dni02.jpg', '18ebd1d4-8dd8-40f0-abd5-54e830bbb77d_pasted.txt', '4be77ab7-705d-4c61-aa08-bd62ed2a8e0c_Formato_A_12345675.pdf', NULL, NULL, NULL),
	(25, 'PENDIENTE', '2025-12-19 18:57:58.065744', 'imvacion de terreno en fonabi', 'Derecho Civil', 'EXP-2025-000025', 'desalojo inmediato', NULL, 49, 50, 'cc9207e9-217b-47de-b51d-6316dec94d61_dni02.jpg', '8c6536b6-a5dd-4530-bdcd-5e20858835d0_Tipos de sistemas archivos.pdf', 'f3b42c9e-daf9-41e2-806e-8eb1791b6bb5_Formato_A_71084182 (1).pdf', NULL, NULL, NULL),
	(26, 'PENDIENTE', '2025-12-21 23:02:23.370471', 'sadas asd a as das da sdaa sd', 'Derecho de Familia', 'EXP-2025-000026', 'adsa  asdasda as dasd', NULL, 52, 53, 'f6ecfbc1-0dfe-4046-b571-bcd84d16fa14_WhatsApp Image 2025-12-21 at 8.22.55 PM.jpeg', '552ba917-bff5-4ea4-8079-35979e8d68a4_WhatsApp Image 2025-12-21 at 8.22.55 PM.jpeg', '29512f69-3ffb-4e9a-adf0-b287794f8bc9_Formato_A_11121222.pdf', NULL, 51, NULL),
	(27, 'PENDIENTE', '2025-12-21 23:02:23.656775', 'sadas asd a as das da sdaa sd', 'Derecho de Familia', 'EXP-2025-000027', 'adsa  asdasda as dasd', NULL, 55, 56, '5a087aa8-7b83-43ce-b471-878dc103b4c6_WhatsApp Image 2025-12-21 at 8.22.55 PM.jpeg', 'ff041909-e9ba-45be-8feb-d7446c974215_WhatsApp Image 2025-12-21 at 8.22.55 PM.jpeg', '3d1b57c1-7096-4ec1-8705-2258c2234cc9_Formato_A_11121222.pdf', NULL, 54, NULL),
	(29, 'PENDIENTE', '2025-12-22 01:06:32.203588', 'asda as dasf a  asf as   as a', 'Derecho de Familia', 'EXP-2025-000028', 'sdasf a sa as  asfsasf ', NULL, 59, 62, '02da23ea-0446-49f4-bfec-8d8b9567cd4c_WhatsApp Image 2025-12-21 at 10.02.54 PM.jpeg', 'd4328329-8b02-4a17-aa76-f587c6ee7be0_WhatsApp Image 2025-12-21 at 10.02.54 PM (1).jpeg', '353c32c5-c422-4c3b-8df1-5c4b03a9e977_Formato_A_22222222.pdf', NULL, 58, NULL),
	(30, 'PENDIENTE', '2025-12-23 18:27:22.257025', 'cumplimiento de hora en el trabajo', 'Derecho Laboral', 'EXP-2025-000029', '4000 soles de compensacion', NULL, 63, 64, 'c0424fa1-c957-4491-ac5e-2f1ab948029f_WhatsApp Image 2025-12-21 at 10.02.53 PM (1).jpeg', 'c71eec6d-f849-41ec-b5d7-ef1d0be14937_Plan de pruebas.pdf', '825ea2fa-a8a0-4f54-9863-921d0cebab24_Formato_A_77777777.pdf', NULL, NULL, NULL),
	(31, 'PENDIENTE', '2025-12-29 13:27:39.248854', 'conflicto en la via publica por derecho alimentario', 'FAMILIA', 'EXP-2025-000030', '500 soles mensuales', 'alimnetario obligatoria ', 65, 66, 'f4207ddf-9b27-47a6-a66a-c9c93f07c76c_WhatsApp Image 2025-12-21 at 10.02.54 PM.jpeg', 'bc1530dc-3813-4fca-abc3-5265ac0d4d05_WhatsApp Image 2025-12-21 at 10.02.54 PM.jpeg', 'c50d17a5-e17a-4c32-8b03-4ab5da8aab44_Formato_A_74525592.pdf', NULL, NULL, 'Pensión de alimentos a favor de conviviente');

-- Volcando estructura para tabla app_esperanza_viva.usuarios
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

-- Volcando estructura para tabla app_esperanza_viva.usuarios_sistema
CREATE TABLE IF NOT EXISTS `usuarios_sistema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('ADMINISTRADOR','DIRECTOR','CONCILIADOR','ABOGADO','NOTIFICADOR') NOT NULL,
  `nro_registro` varchar(50) DEFAULT NULL,
  `nro_especializacion` varchar(50) DEFAULT NULL,
  `nro_colegiatura` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_registro` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuarios_sistema: ~4 rows (aproximadamente)
INSERT INTO `usuarios_sistema` (`id`, `nombre_completo`, `usuario`, `contrasena`, `rol`, `nro_registro`, `nro_especializacion`, `nro_colegiatura`, `estado`, `fecha_registro`) VALUES
	(2, 'David Quispe Maucaylle', 'david', 'david', 'ADMINISTRADOR', NULL, NULL, NULL, 'ACTIVO', '2025-12-21'),
	(3, 'Rut Coaquira Leo', 'rut', 'rut', 'ABOGADO', NULL, NULL, 'Col-12345', 'ACTIVO', '2025-12-22'),
	(4, 'Jamileth Cruz Llicahua', 'jamileth', 'jamileth', 'CONCILIADOR', 'Reg-12354', 'Col-12354', 'Col-32145', 'ACTIVO', '2025-12-22'),
	(5, 'directorr', 'director', 'director', 'DIRECTOR', '', '', '', 'ACTIVO', '2025-12-28');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
