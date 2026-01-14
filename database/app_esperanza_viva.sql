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
  `asistencia_solicitante` varchar(255) DEFAULT NULL,
  `asistencia_invitado` varchar(255) DEFAULT NULL,
  `resultado_tipo` varchar(50) DEFAULT NULL,
  `resultado_detalle` text DEFAULT NULL,
  `abogado_verificador_id` int(11) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_audiencia_solicitud` (`solicitud_id`),
  KEY `FK_audiencia_abogado` (`abogado_verificador_id`),
  CONSTRAINT `FK_audiencia_abogado` FOREIGN KEY (`abogado_verificador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_audiencia_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.audiencias: ~12 rows (aproximadamente)
INSERT INTO `audiencias` (`id`, `solicitud_id`, `fecha_audiencia`, `hora_audiencia`, `lugar`, `asistencia_solicitante`, `asistencia_invitado`, `resultado_tipo`, `resultado_detalle`, `abogado_verificador_id`, `fecha_registro`) VALUES
	(1, 11, '2026-01-10', '09:00:00', 'Sala A', 'Asistio', 'Asistio', 'Acuerdo Total', 'Acuerdo Total', NULL, '2026-01-07 23:56:04'),
	(2, 12, '2026-01-10', '11:00:00', 'Sala B', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(3, 13, '2026-01-11', '10:00:00', 'Sala Virtual', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(4, 14, '2026-01-12', '15:00:00', 'Sala A', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(5, 15, '2026-01-13', '10:30:00', 'Sala B', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(6, 1, '2026-01-08', '09:26:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'Asistio', 'Asistio', 'Inasistencias', 'Inasistencia de una de las partes', NULL, '2026-01-08 04:26:37'),
	(7, 1, '2026-01-14', '15:00:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, 'Inasistencia/Suspensión', 'No habiendo asistido NINGUNA de las partes...', NULL, '2026-01-08 15:43:20'),
	(8, 1, '2026-01-22', '18:00:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'No asistio', 'No asistio', 'Acuerdo Total', 'Acuerdo Total', NULL, '2026-01-08 15:58:00'),
	(9, 1, '2026-01-09', '18:08:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'Asistio', 'No asistio', 'Acuerdo Total', 'Acuerdo Total', NULL, '2026-01-08 21:08:29'),
	(10, 1, '2026-01-16', '06:10:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, NULL, NULL, NULL, '2026-01-08 21:10:47'),
	(11, 1, '2026-02-12', '22:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'No asistio', 'No asistio', 'Suspension', 'Suspension', NULL, '2026-01-08 21:17:24'),
	(12, 16, '2026-01-20', '11:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, NULL, NULL, NULL, '2026-01-09 23:21:48'),
	(13, 16, '2026-01-29', '16:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, NULL, NULL, NULL, '2026-01-09 23:22:23');

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
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.auditoria: ~186 rows (aproximadamente)
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
	(63, '2026-01-05 02:00:34', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(64, '2026-01-05 16:36:35', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(65, '2026-01-05 16:36:35', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(66, '2026-01-05 16:36:57', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(67, '2026-01-05 16:39:44', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(68, '2026-01-05 16:40:10', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(69, '2026-01-05 16:49:30', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(70, '2026-01-05 16:49:30', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(71, '2026-01-05 18:11:48', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(72, '2026-01-05 18:12:16', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(73, '2026-01-05 18:13:01', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(74, '2026-01-05 18:14:02', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(75, '2026-01-05 18:21:23', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(76, '2026-01-05 18:26:28', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(77, '2026-01-05 18:31:06', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(78, '2026-01-05 18:32:19', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(79, '2026-01-05 19:03:55', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(80, '2026-01-05 19:04:42', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(81, '2026-01-05 19:38:23', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(82, '2026-01-05 19:38:35', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(83, '2026-01-05 19:43:25', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(84, '2026-01-05 19:44:01', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(85, '2026-01-05 19:51:05', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(86, '2026-01-05 19:53:40', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(87, '2026-01-07 18:19:01', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(88, '2026-01-07 18:20:54', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(89, '2026-01-07 18:27:34', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(90, '2026-01-07 19:04:32', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(91, '2026-01-07 19:04:55', 'Administrador', 'REGISTRO', 'Se registró nuevo personal: dasads (NOTIFICADOR)', NULL),
	(92, '2026-01-07 19:07:45', 'Administrador', 'ELIMINACIÓN', 'Se eliminó al usuario: sadsasd', NULL),
	(93, '2026-01-07 19:09:20', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(94, '2026-01-07 19:15:26', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(95, '2026-01-07 19:16:34', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(96, '2026-01-07 19:16:52', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(97, '2026-01-07 19:17:14', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: director', NULL),
	(98, '2026-01-07 19:19:33', 'Administrador', 'REGISTRO', 'Se registró nuevo personal: Juancito (CONCILIADOR)', NULL),
	(99, '2026-01-07 19:19:55', 'Juancito', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(100, '2026-01-07 19:23:13', 'jamileth', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(101, '2026-01-07 19:25:18', 'director', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(102, '2026-01-07 19:26:53', 'Juancito', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(103, '2026-01-07 23:56:50', 'david', 'LOGIN', 'Ingreso exitoso al sistema', NULL),
	(104, '2026-01-08 00:29:09', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(105, '2026-01-08 00:30:07', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: david', NULL),
	(106, '2026-01-08 00:31:41', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(107, '2026-01-08 00:31:51', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(108, '2026-01-08 00:32:28', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: director', NULL),
	(109, '2026-01-08 00:40:15', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(110, '2026-01-08 00:54:55', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(111, '2026-01-08 00:58:46', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(112, '2026-01-08 01:02:28', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(113, '2026-01-08 01:03:34', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(114, '2026-01-08 01:04:22', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(115, '2026-01-08 03:16:39', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(116, '2026-01-08 03:25:09', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(117, '2026-01-08 03:29:36', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(118, '2026-01-08 03:40:11', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(119, '2026-01-08 03:40:41', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(120, '2026-01-08 03:41:08', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(121, '2026-01-08 03:41:52', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(122, '2026-01-08 03:45:46', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(123, '2026-01-08 03:46:23', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(124, '2026-01-08 15:42:12', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(125, '2026-01-08 15:42:29', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(126, '2026-01-08 21:07:41', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(127, '2026-01-08 21:44:34', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(128, '2026-01-08 21:53:50', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(129, '2026-01-08 21:58:37', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(130, '2026-01-08 23:07:17', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(131, '2026-01-08 23:14:19', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(132, '2026-01-08 23:14:53', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(133, '2026-01-08 23:17:51', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(134, '2026-01-08 23:17:59', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(135, '2026-01-08 23:18:43', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(136, '2026-01-08 23:22:49', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(137, '2026-01-08 23:31:08', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(138, '2026-01-08 23:44:56', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(139, '2026-01-08 23:49:39', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(140, '2026-01-09 00:02:18', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(141, '2026-01-09 00:48:21', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(142, '2026-01-09 00:59:33', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(143, '2026-01-09 08:03:20', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(144, '2026-01-09 08:29:30', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(145, '2026-01-09 08:33:24', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(146, '2026-01-09 18:31:08', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(147, '2026-01-09 18:33:56', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(148, '2026-01-09 18:35:38', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(149, '2026-01-09 18:38:40', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(150, '2026-01-09 18:39:41', 'Administrador', 'REGISTRO', 'Se registró nuevo personal: davicito (ABOGADO)', NULL),
	(151, '2026-01-09 18:40:02', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(152, '2026-01-09 18:58:08', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(153, '2026-01-09 19:00:08', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: Juancito', NULL),
	(154, '2026-01-09 19:13:16', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(155, '2026-01-09 23:16:37', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(156, '2026-01-09 23:18:06', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(157, '2026-01-09 23:20:02', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(158, '2026-01-09 23:37:17', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(159, '2026-01-09 23:47:38', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(160, '2026-01-09 23:47:59', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(161, '2026-01-12 22:30:36', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(162, '2026-01-12 22:30:36', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(163, '2026-01-12 22:30:54', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(164, '2026-01-12 22:34:11', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(165, '2026-01-12 22:34:39', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(166, '2026-01-12 22:37:26', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(167, '2026-01-12 22:43:16', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(168, '2026-01-13 23:00:15', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(169, '2026-01-13 23:00:29', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(170, '2026-01-13 23:00:48', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(171, '2026-01-13 23:00:53', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(172, '2026-01-13 23:01:01', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(173, '2026-01-13 23:07:26', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(174, '2026-01-13 23:07:48', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(175, '2026-01-13 23:08:08', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(176, '2026-01-13 23:08:16', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(177, '2026-01-13 23:08:37', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(178, '2026-01-13 23:15:00', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(179, '2026-01-13 23:22:00', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(180, '2026-01-13 23:26:11', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(181, '2026-01-13 23:26:26', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(182, '2026-01-13 23:55:15', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(183, '2026-01-13 23:55:20', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(184, '2026-01-13 23:55:28', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(185, '2026-01-14 00:01:58', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: david', NULL),
	(186, '2026-01-14 00:02:13', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: Juancito', NULL),
	(187, '2026-01-14 00:02:55', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(188, '2026-01-14 00:26:08', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(189, '2026-01-14 00:33:54', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(190, '2026-01-14 00:34:27', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(191, '2026-01-14 00:44:24', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(192, '2026-01-14 00:44:37', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(193, '2026-01-14 00:45:49', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.personas: ~30 rows (aproximadamente)
INSERT INTO `personas` (`id`, `apellidos`, `correo_electronico`, `dni`, `domicilio`, `nombres`, `telefono`) VALUES
	(1, 'Mendoza Riva', 'carlos@mail.com', '10203040', 'Av. Sol 450 - Cusco', 'Carlos', '987123456'),
	(2, 'Guzmán Loayza', 'ana@mail.com', '50607080', 'Calle Nueva 123 - Cusco', 'Ana', '955444333'),
	(3, 'Pinto Salas', 'roberto@mail.com', '20304050', 'Urb. Los Pinos A-12', 'Roberto', '912000111'),
	(4, 'Fernández Vega', 'lucia@mail.com', '30405060', 'Jr. Comercio 500', 'Lucía', '999888777'),
	(5, 'Suarez Torres', 'marco@mail.com', '40506070', 'Av. Cultura 1020', 'Marco', '944555666'),
	(6, 'Vargas Machuca', 'elena@mail.com', '60708090', 'Calle Belén 205', 'Elena', '977111222'),
	(7, 'Quispe Choque', 'juan@mail.com', '70809010', 'Av. Ejercito 300', 'Juan', '988777666'),
	(8, 'Mani Huaman', 'rosa@mail.com', '80901020', 'Jr. Lima 440', 'Rosa', '911222333'),
	(9, 'Soto Mayor', 'luis@mail.com', '90102030', 'Calle Túpac Amaru 12', 'Luis', '922333444'),
	(10, 'Cáceres Beltrán', 'julia@mail.com', '11223344', 'Av. Garcilaso 800', 'Julia', '933444555'),
	(11, 'Navarro Flor', 'pedro@mail.com', '22334455', 'Urb. Progreso Z-1', 'Pedro', '944666777'),
	(12, 'Luz de Luna', 'carmen@mail.com', '33445566', 'Jr. Puno 333', 'Carmen', '955777888'),
	(13, 'Paredes Diaz', 'hugo@mail.com', '44556677', 'Av. Regional 456', 'Hugo', '966888999'),
	(14, 'Velasco Quispe', 'sara@mail.com', '55667788', 'Calle Mantas 100', 'Sara', '977999000'),
	(15, 'Tello Rojas', 'andres@mail.com', '66778899', 'Jr. Loreto 210', 'Andrés', '900111222'),
	(16, 'Ramos Jara', 'monica@mail.com', '77889900', 'Urb. Larapa H-5', 'Mónica', '922444666'),
	(17, 'Ortiz Luna', 'felipe@mail.com', '88990011', 'Av. Infancia 120', 'Felipe', '933555777'),
	(18, 'Mollo Salas', 'diana@mail.com', '99001122', 'Calle Matará 400', 'Diana', '944666888'),
	(19, 'Luna Valiente', 'oscar@mail.com', '12121212', 'Jr. Ayacucho 305', 'Oscar', '955777999'),
	(20, 'Zúñiga Rey', 'vania@mail.com', '23232323', 'Av. El Sol 900', 'Vania', '966888000'),
	(21, 'Maza Ruiz', 'kevin@mail.com', '34343434', 'Jr. Grau 550', 'Kevin', '977999111'),
	(22, 'Arias Ponce', 'gaby@mail.com', '45454545', 'Urb. Santa Rosa', 'Gaby', '988000222'),
	(23, 'Flores Gil', 'javier@mail.com', '56565656', 'Calle Hospital 12', 'Javier', '999111333'),
	(24, 'Ríos Franco', 'nadia@mail.com', '67676767', 'Av. Tullumayo 88', 'Nadia', '900222444'),
	(25, 'Castro Morales', 'raul@mail.com', '78787878', 'Jr. Tambopata 10', 'Raúl', '911333555'),
	(26, 'Guerra Paz', 'sonia@mail.com', '89898989', 'Av. San Martín 45', 'Sonia', '922444666'),
	(27, 'Zela Bravo', 'tito@mail.com', '90909090', 'Calle Plateros 20', 'Tito', '933555777'),
	(28, 'Morocho Sol', 'iris@mail.com', '01010101', 'Urb. Magisterio', 'Iris', '944666888'),
	(29, 'Valle Bajo', 'elias@mail.com', '02020202', 'Jr. San Juan 15', 'Elias', '955777999'),
	(30, 'Cueva Piedra', 'ruth@mail.com', '03030303', 'Av. Pardo 600', 'Ruth', '966888000'),
	(31, 'quispe maucaylle', 'fredy@gmail.com', '12345673', 'av. Las Intimpas', 'fredy', '966495094'),
	(32, 'quispe maucaylle', 'david@gmail.com', '74555592', 'av. cahuide sn', 'david', '966495094');

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
  `conciliador_id` int(11) DEFAULT NULL,
  `modalidad` varchar(20) DEFAULT 'Presencial',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nsc320da2826bdguyjbcidabi` (`numero_expediente`),
  KEY `FKnx29kewjsix08a31l38r6u9qm` (`invitado_id`),
  KEY `FKtmtdtohlq556172hsglu76oe8` (`solicitante_id`),
  KEY `apoderado_id` (`apoderado_id`),
  KEY `FKknc5erwpe4wqhnx6599sgscq9` (`conciliador_id`),
  CONSTRAINT `FKknc5erwpe4wqhnx6599sgscq9` FOREIGN KEY (`conciliador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FKnx29kewjsix08a31l38r6u9qm` FOREIGN KEY (`invitado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FKtmtdtohlq556172hsglu76oe8` FOREIGN KEY (`solicitante_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`apoderado_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.solicitudes: ~16 rows (aproximadamente)
INSERT INTO `solicitudes` (`id`, `estado`, `fecha_presentacion`, `hechos`, `materia_conciliable`, `numero_expediente`, `pretension`, `otras_personas_alimentario`, `invitado_id`, `solicitante_id`, `dni_archivo_url`, `pruebas_archivo_url`, `firma_archivo_url`, `observacion`, `apoderado_id`, `sub_materia`, `conciliador_id`, `modalidad`) VALUES
	(1, 'ASIGNADO', '2026-01-01 10:00:00.000000', 'Pensión de alimentos para menor.', 'FAMILIA', 'EXP-2026-001', '1000 soles mensuales.', NULL, 2, 1, NULL, NULL, NULL, '', NULL, NULL, 4, 'Presencial'),
	(2, 'PENDIENTE', '2026-01-01 11:30:00.000000', 'Incumplimiento de contrato de alquiler.', 'CIVIL', 'EXP-2026-002', 'Desalojo y pago de meses.', NULL, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(3, 'PENDIENTE', '2026-01-02 09:15:00.000000', 'Régimen de visitas.', 'FAMILIA', 'EXP-2026-003', 'Fines de semana.', NULL, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(4, 'PENDIENTE', '2026-01-02 15:45:00.000000', 'Deuda de dinero.', 'CIVIL', 'EXP-2026-004', 'Pago de 5000 soles.', NULL, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(5, 'PENDIENTE', '2026-01-03 08:00:00.000000', 'Tenencia de menor.', 'FAMILIA', 'EXP-2026-005', 'Tenencia compartida.', NULL, 10, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(6, 'ASIGNADO', '2026-01-04 10:00:00.000000', 'Indemnización por daños.', 'CIVIL', 'EXP-2026-006', 'Pago de daños en vehículo.', NULL, 12, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(7, 'ASIGNADO', '2026-01-04 12:00:00.000000', 'Aumento de pensión.', 'FAMILIA', 'EXP-2026-007', 'Subir a 800 soles.', NULL, 14, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(8, 'ASIGNADO', '2026-01-05 09:30:00.000000', 'Otorgamiento de escritura.', 'CIVIL', 'EXP-2026-008', 'Firma de documentos.', NULL, 16, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(9, 'ASIGNADO', '2026-01-05 14:00:00.000000', 'Gastos de embarazo.', 'FAMILIA', 'EXP-2026-009', 'Pago de gastos médicos.', NULL, 18, 17, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(10, 'ASIGNADO', '2026-01-06 11:00:00.000000', 'División y partición.', 'CIVIL', 'EXP-2026-010', 'Reparto de herencia.', NULL, 20, 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(11, 'PENDIENTE_ACTA', '2026-01-01 10:00:00.000000', 'Reducción de alimentos.', 'FAMILIA', 'EXP-2026-011', 'Bajar a 300 soles.', NULL, 22, 21, NULL, NULL, NULL, 'Ha aceptado el caso con éxito.', NULL, NULL, 3, 'Presencial'),
	(12, 'DESIGNACION_ACEPTADA', '2026-01-02 11:00:00.000000', 'Resolución de contrato.', 'CIVIL', 'EXP-2026-012', 'Anulación de compraventa.', NULL, 24, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(13, 'DESIGNACION_ACEPTADA', '2026-01-03 14:00:00.000000', 'Reconocimiento de unión de hecho.', 'FAMILIA', 'EXP-2026-013', 'Declaración legal.', NULL, 26, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(14, 'DESIGNACION_ACEPTADA', '2026-01-04 15:30:00.000000', 'Reivindicación.', 'CIVIL', 'EXP-2026-014', 'Recuperación de propiedad.', NULL, 28, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial'),
	(15, 'ASIGNADO', '2026-01-05 08:45:00.000000', 'Exoneración de alimentos.', 'FAMILIA', 'EXP-2026-015', 'Cese de pago por mayoría de edad.', NULL, 30, 29, NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Presencial'),
	(16, 'AUDIENCIA_PROGRAMADA', '2026-01-09 22:17:43.802164', 'incumplimiento de trabajo de jordana en la obra, y sin justificacion', 'CIVIL', 'EXP-2025-000016', 'quiero que ya no trabaje y que me pague 4000 soles por el tiempo de perdida', '', 31, 32, 'cbb618a3-2ee8-4a0e-84e6-2520ad8b9e15_WhatsApp Image 2026-01-09 at 7.42.28 PM.jpeg', '9317076c-8ada-4a77-8f5b-023acfd4b490_WhatsApp Image 2026-01-08 at 3.48.50 AM.jpeg', '7fee9c13-70de-478a-8bfb-da77d83fb185_Formato_A_74555592.doc', 'Ha aceptado el caso con éxito.', NULL, 'Incumplimiento de contrato', 3, 'Presencial');

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
  `dni` varchar(15) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `correo_electronico` varchar(150) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('ADMINISTRADOR','DIRECTOR','CONCILIADOR','ABOGADO','NOTIFICADOR') NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_registro` date NOT NULL,
  `nro_colegiatura` varchar(50) DEFAULT NULL,
  `nro_especializacion` varchar(50) DEFAULT NULL,
  `nro_registro` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuarios_sistema: ~5 rows (aproximadamente)
INSERT INTO `usuarios_sistema` (`id`, `nombre_completo`, `dni`, `telefono`, `direccion`, `correo_electronico`, `usuario`, `contrasena`, `rol`, `estado`, `fecha_registro`, `nro_colegiatura`, `nro_especializacion`, `nro_registro`) VALUES
	(2, 'David Quispe Maucaylle', '74555592', '966495094', 'Av. Principal 123', 'david@gmail.com', 'david', 'david', 'ADMINISTRADOR', 'ACTIVO', '2025-12-21', NULL, NULL, NULL),
	(3, 'Rut Coaquira Leo', '12233333', '986547222', 'Av. Canada', 'rut@gmail.com', 'rut123', 'rut123', 'CONCILIADOR', 'ACTIVO', '2025-12-22', NULL, NULL, '12323'),
	(4, 'Jamileth Cruz Llicahua', '12345678', '987654321', 'Calle Pinitos 456', 'jamileth@mail.com', 'jamileth', 'jamileth', 'CONCILIADOR', 'ACTIVO', '2025-12-22', NULL, NULL, '122222'),
	(5, 'director', '11111111', '987654321', 'AV. soles', 'dire@gmail.com', 'director', 'director', 'DIRECTOR', 'ACTIVO', '2025-12-28', NULL, NULL, NULL),
	(7, 'Juancito', '77777777', '986574321', 'abancay', 'Juancito@gmail.com', 'Juancito', '12345', 'NOTIFICADOR', 'ACTIVO', '2026-01-07', '25478', NULL, NULL),
	(8, 'davicito', '77777777', '987653214', 'abancay', 'davicito@hotmail.com', 'davicito', 'davicito', 'ABOGADO', 'ACTIVO', '2026-01-09', '98354', '', '');

-- Volcando estructura para tabla app_esperanza_viva.usuario_roles
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` int(11) NOT NULL,
  `rol` varchar(255) DEFAULT NULL,
  KEY `FKk4cac2dltfhst8uiupeyff98a` (`usuario_id`),
  CONSTRAINT `FKk4cac2dltfhst8uiupeyff98a` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_sistema` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuario_roles: ~8 rows (aproximadamente)
INSERT INTO `usuario_roles` (`usuario_id`, `rol`) VALUES
	(2, 'ADMINISTRADOR'),
	(3, 'CONCILIADOR'),
	(4, 'CONCILIADOR'),
	(5, 'DIRECTOR'),
	(7, 'NOTIFICADOR'),
	(8, 'ABOGADO'),
	(3, 'NOTIFICADOR'),
	(7, 'ABOGADO');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
