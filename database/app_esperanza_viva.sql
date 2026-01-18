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

-- Volcando estructura para tabla app_esperanza_viva.actas
CREATE TABLE IF NOT EXISTS `actas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `archivo_url` text DEFAULT NULL,
  `fecha_generacion` datetime(6) DEFAULT NULL,
  `numero_acta` varchar(255) DEFAULT NULL,
  `tipo_acta` varchar(255) DEFAULT NULL,
  `tipo_resultado` varchar(100) DEFAULT NULL,
  `audiencia_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_audiencia_acta` (`audiencia_id`),
  UNIQUE KEY `UK_numero_acta` (`numero_acta`),
  CONSTRAINT `FK_acta_audiencia` FOREIGN KEY (`audiencia_id`) REFERENCES `audiencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.actas: ~4 rows (aproximadamente)
INSERT INTO `actas` (`id`, `archivo_url`, `fecha_generacion`, `numero_acta`, `tipo_acta`, `tipo_resultado`, `audiencia_id`) VALUES
	(1, 'http://localhost:8080/uploads/ACTA_15_0e7c0503-8068-45ef-9e08-65982cd6bf35.pdf', '2026-01-16 17:23:19.367865', 'ACTA-ACUERDO-PARCIAL-SUSTENTO-15-1768669328316', 'ACUERDO_PARCIAL_SUSTENTO', 'INASISTENCIA', 15),
	(2, 'http://localhost:8080/uploads/ACTA_DEMO_ABOGADO.pdf', '2026-01-17 11:49:28.000000', 'ACTA-DEMO-0013', 'ACUERDO_TOTAL', 'ACUERDO', 3),
	(3, 'http://localhost:8080/uploads/ACTA_5_e088de27-1ed7-4a62-a3a1-187cb7881dd5.pdf', '2026-01-17 12:01:04.197879', 'ACTA-INASISTENCIA-AMBAS-5-1768704440385', 'INASISTENCIA_AMBAS_PARTES', NULL, 5),
	(4, 'http://localhost:8080/uploads/ACTA_12_e97e64ee-1d3b-47ce-b280-9af3c06fb3fd.pdf', '2026-01-17 17:57:48.429210', 'ACTA-FALTA-ACUERDO-PROP-12-1768690667647', 'FALTA_ACUERDO_POSICIONES', NULL, 12);

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
  UNIQUE KEY `UK_solicitud` (`solicitud_id`),
  KEY `FK_audiencia_solicitud` (`solicitud_id`),
  KEY `FK_audiencia_abogado` (`abogado_verificador_id`),
  CONSTRAINT `FK_audiencia_abogado` FOREIGN KEY (`abogado_verificador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_audiencia_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.audiencias: ~6 rows (aproximadamente)
INSERT INTO `audiencias` (`id`, `solicitud_id`, `fecha_audiencia`, `hora_audiencia`, `lugar`, `asistencia_solicitante`, `asistencia_invitado`, `resultado_tipo`, `resultado_detalle`, `abogado_verificador_id`, `fecha_registro`) VALUES
	(2, 12, '2026-01-10', '11:00:00', 'Sala B', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(3, 13, '2026-01-11', '10:00:00', 'Sala Virtual', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(4, 14, '2026-01-12', '15:00:00', 'Sala A', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(5, 15, '2026-01-13', '10:30:00', 'Sala B', NULL, NULL, 'Inasistencia de ambas partes', '{"hechos":"Exoneración de alimentos.","controversia":"FAMILIA","fechaPrimeraCitacion":"2026-01-18","horaPrimeraCitacion":"10:00","fechaSegundaCitacion":"2026-01-18","horaSegundaCitacion":"10:00","solicitanteDireccion":"Jr. San Juan 15","invitadoDireccion":"Av. Pardo 600","lugarAudiencia":"Av. Sol 450 - Cusco","horaVerificacion":"09:47 p. m.","actaUrl":"http://localhost:8080/uploads/ACTA_5_e088de27-1ed7-4a62-a3a1-187cb7881dd5.pdf"}', NULL, '2026-01-07 23:56:04'),
	(12, 16, '2026-01-20', '11:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, 'Falta de Acuerdo con Posiciones', '{"hechos":"incumplimiento de trabajo de jordana en la obra, y sin justificacion","controversia":"no quiero cumplir con el contrato","motivoFaltaAcuerdo":"nadie esta de acuerdo","posicionSolicitante":"quiero que si o si me cumpla","posicionInvitado":"no no quiero por que no hay plata","propuestaSolicitante":"no quiero que se cumpla","propuestaInvitado":"para que si todo es igual","lugarAudiencia":"Av. Sol 450 - Cusco","solicitanteDireccion":"av. cahuide sn","invitadoDireccion":"av. Las Intimpas","conciliadorDni":"12233333","conciliadorRegistro":"12323","conciliadorEspecialidad":"","actaUrl":"http://localhost:8080/uploads/ACTA_12_e97e64ee-1d3b-47ce-b280-9af3c06fb3fd.pdf"}', NULL, '2026-01-09 23:21:48'),
	(15, 11, '2026-01-15', '20:17:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, 'Acuerdo Parcial con Sustento de Reconvencion', '{"hechos":"Reducción de alimentos.","controversia":"","puntosSinAcuerdo":"","abogadoVerificador":"","lugarAudiencia":"Av. Sol 450 - Cusco","solicitanteDireccion":"Jr. Grau 550","invitadoDireccion":"Urb. Santa Rosa","conciliadorDni":"12233333","conciliadorRegistro":"12323","conciliadorEspecialidad":"","hechosInvitado":"","controversiaInvitado":"","acuerdos":[{"titulo":"PRIMERO","contenido":""},{"titulo":"SEGUNDO","contenido":""}],"actaUrl":"http://localhost:8080/uploads/ACTA_15_0e7c0503-8068-45ef-9e08-65982cd6bf35.pdf"}', NULL, '2026-01-14 18:17:24');

-- Volcando estructura para tabla app_esperanza_viva.audiencia_clausulas
CREATE TABLE IF NOT EXISTS `audiencia_clausulas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `audiencia_id` bigint(20) NOT NULL,
  `orden` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_clausula_audiencia` (`audiencia_id`),
  CONSTRAINT `FK_clausula_audiencia` FOREIGN KEY (`audiencia_id`) REFERENCES `audiencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.audiencia_clausulas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla app_esperanza_viva.auditoria
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `usuario_nombre` varchar(150) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `solicitud_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_auditoria_solicitud` (`solicitud_id`),
  CONSTRAINT `FK_auditoria_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=323 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.auditoria: ~61 rows (aproximadamente)
INSERT INTO `auditoria` (`id`, `fecha_hora`, `usuario_nombre`, `accion`, `detalles`, `solicitud_id`) VALUES
	(256, '2026-01-16 17:12:06', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(257, '2026-01-16 17:15:36', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencias', 11),
	(258, '2026-01-16 17:23:19', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencia de una de las partes', 11),
	(259, '2026-01-16 17:29:37', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(260, '2026-01-16 17:39:57', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(261, '2026-01-16 17:41:19', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(262, '2026-01-16 17:46:42', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(264, '2026-01-16 17:54:13', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(265, '2026-01-16 18:12:51', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencias', 11),
	(266, '2026-01-16 18:12:58', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencia de ambas partes', 11),
	(267, '2026-01-16 18:13:52', 'Conciliador', 'RESULTADO', 'Resultado registrado: Suspension', 16),
	(268, '2026-01-16 18:30:54', 'Usuario Web', 'REGISTRO', 'Nueva solicitud ingresada: EXP-2025-000018', 18),
	(269, '2026-01-16 18:32:06', 'Usuario Web', 'REGISTRO', 'Nueva solicitud ingresada: EXP-2025-000019', 19),
	(270, '2026-01-16 18:32:18', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(271, '2026-01-16 18:33:27', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(272, '2026-01-16 21:00:02', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(275, '2026-01-17 11:53:47', 'Director/Sistema', 'ACTUALIZACION', 'Estado actualizado a NOTIFICADO', 12),
	(276, '2026-01-17 12:00:19', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(277, '2026-01-17 12:01:00', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencias', 15),
	(278, '2026-01-17 12:01:04', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencia de una de las partes', 15),
	(279, '2026-01-17 12:01:33', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(280, '2026-01-17 12:01:46', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(281, '2026-01-17 12:02:01', 'Conciliador', 'RESULTADO', 'Resultado registrado: Acuerdo Parcial', 11),
	(282, '2026-01-17 12:02:08', 'Conciliador', 'RESULTADO', 'Resultado registrado: Acuerdo Parcial con Sustento de Reconvencion', 11),
	(284, '2026-01-17 12:04:50', 'Director/Sistema', 'ACTUALIZACION', 'Estado actualizado a FINALIZADA (Obs: Aprobado legalmente)', 11),
	(285, '2026-01-17 12:39:04', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(286, '2026-01-17 12:42:18', 'Administrador', 'REGISTRO', 'Se registró nuevo personal: davico ([SECRETARIO])', NULL),
	(287, '2026-01-17 12:42:35', 'davico', 'LOGIN', 'Ingreso exitoso', NULL),
	(288, '2026-01-17 17:54:47', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(289, '2026-01-17 17:55:23', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(290, '2026-01-17 17:56:00', 'Conciliador', 'RESULTADO', 'Resultado registrado: Falta de Acuerdo', 16),
	(291, '2026-01-17 17:57:48', 'Conciliador', 'RESULTADO', 'Resultado registrado: Falta de Acuerdo con Posiciones', 16),
	(292, '2026-01-17 17:59:55', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(293, '2026-01-17 18:00:30', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(294, '2026-01-17 18:06:07', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(295, '2026-01-17 18:06:26', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: rut123', NULL),
	(296, '2026-01-17 18:06:38', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: juancito', NULL),
	(298, '2026-01-17 18:11:55', 'Director/Sistema', 'ACTUALIZACION', 'Estado actualizado a OBSERVADA (Obs: Observación realizada por abogado)', 15),
	(299, '2026-01-17 18:12:51', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(300, '2026-01-17 18:15:51', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(301, '2026-01-17 18:16:05', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(302, '2026-01-17 18:20:52', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(303, '2026-01-17 18:23:05', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(304, '2026-01-17 18:46:51', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(306, '2026-01-17 20:47:07', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(307, '2026-01-17 20:49:58', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(308, '2026-01-17 20:50:53', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(309, '2026-01-17 20:51:59', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(310, '2026-01-17 21:12:01', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(311, '2026-01-17 21:13:19', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(312, '2026-01-17 21:29:03', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(313, '2026-01-17 21:29:41', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: davicito', NULL),
	(314, '2026-01-17 21:30:00', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(315, '2026-01-17 21:45:44', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(316, '2026-01-17 21:46:18', 'Director/Sistema', 'ACTUALIZACION', 'Estado actualizado a DESIGNACION_ACEPTADA (Obs: Ha aceptado el caso con éxito.)', 2),
	(317, '2026-01-17 21:47:16', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencias', 15),
	(318, '2026-01-17 21:47:20', 'Conciliador', 'RESULTADO', 'Resultado registrado: Inasistencia de ambas partes', 15),
	(319, '2026-01-17 21:47:50', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(320, '2026-01-17 21:48:21', 'david', 'LOGIN', 'Ingreso exitoso', NULL),
	(321, '2026-01-17 21:48:48', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: jamileth', NULL),
	(322, '2026-01-17 21:49:38', 'Administrador', 'ACTUALIZACIÓN', 'Se actualizaron datos de: juancito', NULL),
	(323, '2026-01-17 22:18:14', 'rut123', 'LOGIN', 'Ingreso exitoso', NULL),
	(324, '2026-01-17 22:20:53', 'director', 'LOGIN', 'Ingreso exitoso', NULL),
	(325, '2026-01-17 22:21:21', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(326, '2026-01-17 22:23:36', 'Director/Sistema', 'ACTUALIZACION', 'Estado actualizado a FINALIZADA (Obs: Aprobado legalmente)', 13),
	(327, '2026-01-17 22:25:59', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(328, '2026-01-17 23:06:10', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(329, '2026-01-17 23:07:11', 'davicito', 'LOGIN', 'Ingreso exitoso', NULL),
	(330, '2026-01-17 23:07:24', 'davico', 'LOGIN', 'Ingreso exitoso', NULL),
	(331, '2026-01-17 23:09:50', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(332, '2026-01-17 23:14:55', 'jamileth', 'LOGIN', 'Ingreso exitoso', NULL),
	(333, '2026-01-17 23:23:46', 'davico', 'LOGIN', 'Ingreso exitoso', NULL),
	(334, '2026-01-17 23:46:36', 'Usuario Web', 'REGISTRO', 'Nueva solicitud ingresada: EXP-2025-000020', 20);

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
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.personas: ~38 rows (aproximadamente)
INSERT INTO `personas` (`id`, `nombres`, `apellidos`, `dni`, `correo_electronico`, `domicilio`, `telefono`) VALUES
	(1, 'Carlos', 'Mendoza Riva', '10203040', 'carlos@mail.com', 'Av. Sol 450 - Cusco', '987123456'),
	(2, 'Ana', 'Guzmán Loayza', '50607080', 'ana@mail.com', 'Calle Nueva 123 - Cusco', '955444333'),
	(3, 'Roberto', 'Pinto Salas', '20304050', 'roberto@mail.com', 'Urb. Los Pinos A-12', '912000111'),
	(4, 'Lucía', 'Fernández Vega', '30405060', 'lucia@mail.com', 'Jr. Comercio 500', '999888777'),
	(5, 'Marco', 'Suarez Torres', '40506070', 'marco@mail.com', 'Av. Cultura 1020', '944555666'),
	(6, 'Elena', 'Vargas Machuca', '60708090', 'elena@mail.com', 'Calle Belén 205', '977111222'),
	(7, 'Juan', 'Quispe Choque', '70809010', 'juan@mail.com', 'Av. Ejercito 300', '988777666'),
	(8, 'Rosa', 'Mani Huaman', '80901020', 'rosa@mail.com', 'Jr. Lima 440', '911222333'),
	(9, 'Luis', 'Soto Mayor', '90102030', 'luis@mail.com', 'Calle Túpac Amaru 12', '922333444'),
	(10, 'Julia', 'Cáceres Beltrán', '11223344', 'julia@mail.com', 'Av. Garcilaso 800', '933444555'),
	(11, 'Pedro', 'Navarro Flor', '22334455', 'pedro@mail.com', 'Urb. Progreso Z-1', '944666777'),
	(12, 'Carmen', 'Luz de Luna', '33445566', 'carmen@mail.com', 'Jr. Puno 333', '955777888'),
	(13, 'Hugo', 'Paredes Diaz', '44556677', 'hugo@mail.com', 'Av. Regional 456', '966888999'),
	(14, 'Sara', 'Velasco Quispe', '55667788', 'sara@mail.com', 'Calle Mantas 100', '977999000'),
	(15, 'Andrés', 'Tello Rojas', '66778899', 'andres@mail.com', 'Jr. Loreto 210', '900111222'),
	(16, 'Mónica', 'Ramos Jara', '77889900', 'monica@mail.com', 'Urb. Larapa H-5', '922444666'),
	(17, 'Felipe', 'Ortiz Luna', '88990011', 'felipe@mail.com', 'Av. Infancia 120', '933555777'),
	(18, 'Diana', 'Mollo Salas', '99001122', 'diana@mail.com', 'Calle Matará 400', '944666888'),
	(19, 'Oscar', 'Luna Valiente', '12121212', 'oscar@mail.com', 'Jr. Ayacucho 305', '955777999'),
	(20, 'Vania', 'Zúñiga Rey', '23232323', 'vania@mail.com', 'Av. El Sol 900', '966888000'),
	(21, 'Kevin', 'Maza Ruiz', '34343434', 'kevin@mail.com', 'Jr. Grau 550', '977999111'),
	(22, 'Gaby', 'Arias Ponce', '45454545', 'gaby@mail.com', 'Urb. Santa Rosa', '988000222'),
	(23, 'Javier', 'Flores Gil', '56565656', 'javier@mail.com', 'Calle Hospital 12', '999111333'),
	(24, 'Nadia', 'Ríos Franco', '67676767', 'nadia@mail.com', 'Av. Tullumayo 88', '900222444'),
	(25, 'Raúl', 'Castro Morales', '78787878', 'raul@mail.com', 'Jr. Tambopata 10', '911333555'),
	(26, 'Sonia', 'Guerra Paz', '89898989', 'sonia@mail.com', 'Av. San Martín 45', '922444666'),
	(27, 'Tito', 'Zela Bravo', '90909090', 'tito@mail.com', 'Calle Plateros 20', '933555777'),
	(28, 'Iris', 'Morocho Sol', '01010101', 'iris@mail.com', 'Urb. Magisterio', '944666888'),
	(29, 'Elias', 'Valle Bajo', '02020202', 'elias@mail.com', 'Jr. San Juan 15', '955777999'),
	(30, 'Ruth', 'Cueva Piedra', '03030303', 'ruth@mail.com', 'Av. Pardo 600', '966888000'),
	(31, 'fredy', 'quispe maucaylle', '12345673', 'fredy@gmail.com', 'av. Las Intimpas', '966495094'),
	(32, 'david', 'quispe maucaylle', '74555592', 'david@gmail.com', 'av. cahuide sn', '966495094'),
	(33, 'dassdsa', 'quispe maucaylle', '12345678', '234567@unamba.edu.pe', 'av las gardenias', '966495094'),
	(34, 'david', 'quispe maucaylle', '12345675', 'david@gmail.com', 'av. Canada', '966495094'),
	(35, 'dfe', 'quispe maucaylle', '12345678', 'dfe@gmail.com', 'av lo champiñones', '966495094'),
	(36, 'fred', 'quispe maucaylle', '12345675', 'fred@gmail.com', 'av. Julio C. Tello', '966495094'),
	(37, 'dfe', 'quispe maucaylle', '12345678', 'dfe@gmail.com', 'av lo champiñones', '966495094'),
	(38, 'fred', 'quispe maucaylle', '12345675', 'fred@gmail.com', 'av. Julio C. Tello', '966495094'),
	(39, 'Jamileth', 'Cruz LLicahua', '12345678', 'jamileth@gmail.com', 'av lo champiñones', '964495094'),
	(40, 'Rut Nory', 'Coaquira Leo', '11113289', 'rut@gmail.com', 'av. Canada', '966435094');

-- Volcando estructura para tabla app_esperanza_viva.solicitudes
CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero_expediente` varchar(255) DEFAULT NULL,
  `estado` enum('PENDIENTE','ASIGNADO','DESIGNACION_ACEPTADA','PROGRAMADO','NOTIFICADO','ENTREGADO','PENDIENTE_FIRMA','PENDIENTE_ACTA','CONCLUIDO_SIN_ACUERDO','CONCLUIDO','OBSERVADA','FINALIZADA','APROBADO') DEFAULT 'PENDIENTE',
  `materia_conciliable` varchar(255) DEFAULT NULL,
  `sub_materia` varchar(255) DEFAULT NULL,
  `fecha_presentacion` datetime(6) DEFAULT NULL,
  `hechos` text DEFAULT NULL,
  `pretension` text DEFAULT NULL,
  `otras_personas_alimentario` text DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `modalidad` varchar(20) DEFAULT 'Presencial',
  `solicitante_id` bigint(20) DEFAULT NULL,
  `invitado_id` bigint(20) DEFAULT NULL,
  `apoderado_id` bigint(20) DEFAULT NULL,
  `conciliador_id` int(11) DEFAULT NULL,
  `notificador_id` int(11) DEFAULT NULL,
  `secretario_id` int(11) DEFAULT NULL,
  `dni_archivo_url` varchar(255) DEFAULT NULL,
  `pruebas_archivo_url` varchar(255) DEFAULT NULL,
  `firma_archivo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_numero_expediente` (`numero_expediente`),
  KEY `FK_solicitante` (`solicitante_id`),
  KEY `FK_invitado` (`invitado_id`),
  KEY `FK_apoderado` (`apoderado_id`),
  KEY `FK_conciliador` (`conciliador_id`),
  KEY `FK_notificador` (`notificador_id`),
  KEY `FK_secretario` (`secretario_id`),
  CONSTRAINT `FK_apoderado` FOREIGN KEY (`apoderado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FK_conciliador` FOREIGN KEY (`conciliador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_invitado` FOREIGN KEY (`invitado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FK_notificador` FOREIGN KEY (`notificador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_secretario` FOREIGN KEY (`secretario_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.solicitudes: ~19 rows (aproximadamente)
INSERT INTO `solicitudes` (`id`, `numero_expediente`, `estado`, `materia_conciliable`, `sub_materia`, `fecha_presentacion`, `hechos`, `pretension`, `otras_personas_alimentario`, `observacion`, `modalidad`, `solicitante_id`, `invitado_id`, `apoderado_id`, `conciliador_id`, `notificador_id`, `secretario_id`, `dni_archivo_url`, `pruebas_archivo_url`, `firma_archivo_url`) VALUES
	(1, 'EXP-2026-000001', 'APROBADO', 'FAMILIA', NULL, '2026-01-01 10:00:00.000000', 'Pensión de alimentos para menor.', '1000 soles mensuales.', NULL, '', 'Presencial', 1, 2, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(2, 'EXP-2026-000002', 'DESIGNACION_ACEPTADA', 'CIVIL', NULL, '2026-01-01 11:30:00.000000', 'Incumplimiento de contrato de alquiler.', 'Desalojo y pago de meses.', NULL, 'Ha aceptado el caso con éxito.', 'Presencial', 3, 4, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(3, 'EXP-2026-000003', 'PENDIENTE', 'FAMILIA', NULL, '2026-01-02 09:15:00.000000', 'Régimen de visitas.', 'Fines de semana.', NULL, NULL, 'Presencial', 5, 6, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(4, 'EXP-2026-000004', 'PENDIENTE', 'CIVIL', NULL, '2026-01-02 15:45:00.000000', 'Deuda de dinero.', 'Pago de 5000 soles.', NULL, NULL, 'Presencial', 7, 8, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(5, 'EXP-2026-000005', 'DESIGNACION_ACEPTADA', 'FAMILIA', NULL, '2026-01-03 08:00:00.000000', 'Tenencia de menor.', 'Tenencia compartida.', NULL, 'Ha aceptado el caso con éxito.', 'Presencial', 9, 10, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(6, 'EXP-2026-000006', 'ASIGNADO', 'CIVIL', NULL, '2026-01-04 10:00:00.000000', 'Indemnización por daños.', 'Pago de daños en vehículo.', NULL, NULL, 'Presencial', 11, 12, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(7, 'EXP-2026-000007', 'ASIGNADO', 'FAMILIA', NULL, '2026-01-04 12:00:00.000000', 'Aumento de pensión.', 'Subir a 800 soles.', NULL, NULL, 'Presencial', 13, 14, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(8, 'EXP-2026-000008', 'ASIGNADO', 'CIVIL', NULL, '2026-01-05 09:30:00.000000', 'Otorgamiento de escritura.', 'Firma de documentos.', NULL, NULL, 'Presencial', 15, 16, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(9, 'EXP-2026-000009', 'ASIGNADO', 'FAMILIA', NULL, '2026-01-05 14:00:00.000000', 'Gastos de embarazo.', 'Pago de gastos médicos.', NULL, NULL, 'Presencial', 17, 18, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(10, 'EXP-2026-000010', 'ASIGNADO', 'CIVIL', NULL, '2026-01-06 11:00:00.000000', 'División y partición.', 'Reparto de herencia.', NULL, NULL, 'Presencial', 19, 20, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(11, 'EXP-2026-000011', 'FINALIZADA', 'FAMILIA', NULL, '2026-01-01 10:00:00.000000', 'Reducción de alimentos.', 'Bajar a 300 soles.', NULL, 'Aprobado legalmente', 'Presencial', 21, 22, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(12, 'EXP-2026-000012', 'NOTIFICADO', 'CIVIL', NULL, '2026-01-02 11:00:00.000000', 'Resolución de contrato.', 'Anulación de purchase.', NULL, NULL, 'Presencial', 23, 24, NULL, 3, 4, NULL, NULL, NULL, NULL),
	(13, 'EXP-2026-000013', 'FINALIZADA', 'FAMILIA', NULL, '2026-01-03 14:00:00.000000', 'Reconocimiento de unión de hecho.', 'Declaración legal.', NULL, 'Aprobado legalmente', 'Presencial', 25, 26, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(14, 'EXP-2026-000014', 'DESIGNACION_ACEPTADA', 'CIVIL', NULL, '2026-01-04 15:30:00.000000', 'Reivindicación.', 'Recuperación de propiedad.', NULL, NULL, 'Presencial', 27, 28, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(15, 'EXP-2026-000015', 'PENDIENTE_FIRMA', 'FAMILIA', NULL, '2026-01-05 08:45:00.000000', 'Exoneración de alimentos.', 'Cese de pago por mayoría de edad.', NULL, 'Observación realizada por abogado', 'Presencial', 29, 30, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(16, 'EXP-2025-000016', 'PENDIENTE_FIRMA', 'CIVIL', 'Incumplimiento de contrato', '2026-01-09 22:17:43.802164', 'incumplimiento de trabajo de jordana en la obra, y sin justificacion', 'quiero que ya no trabaje y que me pague 4000 soles por el tiempo de perdida', '', 'Ha aceptado el caso con éxito.', 'Presencial', 32, 31, NULL, 3, NULL, NULL, 'cbb618a3-2ee8-4a0e-84e6-2520ad8b9e15_WhatsApp Image 2026-01-09 at 7.42.28 PM.jpeg', '9317076c-8ada-4a77-8f5b-023acfd4b490_WhatsApp Image 2026-01-08 at 3.48.50 AM.jpeg', '7fee9c13-70de-478a-8bfb-da77d83fb185_Formato_A_74555592.doc'),
	(17, 'EXP-2025-000017', 'PENDIENTE', 'FAMILIA', 'Pensión de alimentos a favor de conviviente', '2026-01-14 19:11:27.914656', 'shjklñsaa  jsnj  aj skdjkjk abskj kj nkjan ans lsdnkj   a', 'saf a   ajshbdhfbdsj kj ajshfb', 'sd ad kjak ja s dkjm kajshjnsbfkjbdkbbdjb kjdb s dfbsh ', NULL, 'Presencial', 34, 33, NULL, 3, NULL, NULL, '149a711c-270f-4e65-a77a-d2194bee937d_Captura de pantalla 2025-10-07 183906.png', NULL, '05ed64d8-1da3-4880-be55-1e857c92cafc_Formato_A_12345675 (1).pdf'),
	(18, 'EXP-2025-000018', 'PENDIENTE', 'CIVIL', 'Desalojo', '2026-01-16 18:30:54.374915', 'No ha pagado la renta durante 6 meses de renta de la habitacion 104 del segundo piso', 'quiero que me pague los 1200 soles y que se retire', '', NULL, 'Presencial', 36, 35, NULL, 3, NULL, NULL, NULL, NULL, NULL),
	(19, 'EXP-2025-000019', 'PENDIENTE', 'CIVIL', 'Desalojo', '2026-01-16 18:32:06.143435', 'No ha pagado la renta durante 6 meses de renta de la habitacion 104 del segundo piso', 'quiero que me pague los 1200 soles y que se retire', '', NULL, 'Virtual', 38, 37, NULL, 3, NULL, NULL, '99c6a7fe-98da-4712-97d6-9087c3afbe88_WhatsApp Image 2026-01-15 at 5.12.34 PM.jpeg', '4fee93c4-6b67-46af-91d9-7df1905bd8f0_Formato_N_Acta_Inasistencia_EXP-2026-011 (1).pdf', 'bef5bcb6-4882-42b3-8b21-6e968cf3f046_Formato_A_12345675 (2).pdf'),
	(20, 'EXP-2025-000020', 'PENDIENTE', 'CIVIL', 'Incumplimiento de contrato', '2026-01-17 23:46:36.458987', 'no cumplio la contrada, son horas de jordas dejadas a un lado sin ningun motivo', 'quiero que me pague 3200 soles por que eso sucedio por un mes competo', '', NULL, 'Virtual', 40, 39, NULL, NULL, NULL, NULL, '344b15f7-a325-473b-8899-fb02ba5fa2bc_WhatsApp Image 2026-01-17 at 12.27.01 PM (1).jpeg', '589276da-7312-4f8e-bed8-c999ed0fc4e0_Formato_N_Acta_Inasistencia_EXP-2026-015.pdf', 'fc25e500-6e56-4d70-9c13-8a52ff31b3ae_Formato_A_11113289.doc');

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
  `rol` enum('ADMINISTRADOR','DIRECTOR','CONCILIADOR','ABOGADO','NOTIFICADOR','SECRETARIO') NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_registro` date NOT NULL,
  `nro_colegiatura` varchar(50) DEFAULT NULL,
  `nro_especializacion` varchar(50) DEFAULT NULL,
  `nro_registro` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuarios_sistema: ~6 rows (aproximadamente)
INSERT INTO `usuarios_sistema` (`id`, `nombre_completo`, `dni`, `telefono`, `direccion`, `correo_electronico`, `usuario`, `contrasena`, `rol`, `estado`, `fecha_registro`, `nro_colegiatura`, `nro_especializacion`, `nro_registro`) VALUES
	(2, 'David Quispe Maucaylle', '74555592', '966495094', 'Av. Principal 123', 'david@gmail.com', 'david', 'david', 'ADMINISTRADOR', 'ACTIVO', '2025-12-21', NULL, NULL, NULL),
	(3, 'Rut Coaquira Leo', '12233333', '986547222', 'Av. Canada', 'rut@gmail.com', 'rut123', 'rut123', 'CONCILIADOR', 'ACTIVO', '2025-12-22', NULL, NULL, '12323'),
	(4, 'Jamileth Cruz Llicahua', '12345678', '987654321', 'Calle Pinitos 456', 'jamileth@mail.com', 'jamileth', 'jamileth', 'NOTIFICADOR', 'ACTIVO', '2025-12-22', '123222', NULL, '122222'),
	(5, 'director', '11111111', '987654321', 'AV. soles', 'dire@gmail.com', 'director', 'director', 'DIRECTOR', 'ACTIVO', '2025-12-28', NULL, NULL, NULL),
	(8, 'davicito', '77777777', '987653214', 'abancay', 'davicito@hotmail.com', 'davicito', 'davicito', 'ABOGADO', 'ACTIVO', '2026-01-09', '98354', '', ''),
	(9, 'davico', '11111111', '911111111', 'abancay', 'davico@gmail.com', 'davico', 'davico', 'SECRETARIO', 'ACTIVO', '2026-01-17', '', '', '');

-- Volcando estructura para tabla app_esperanza_viva.usuario_roles
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` int(11) NOT NULL,
  `rol` varchar(255) DEFAULT NULL,
  KEY `FK_usuario_roles` (`usuario_id`),
  CONSTRAINT `FK_usuario_roles` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_sistema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla app_esperanza_viva.usuario_roles: ~6 rows (aproximadamente)
INSERT INTO `usuario_roles` (`usuario_id`, `rol`) VALUES
	(2, 'ADMINISTRADOR'),
	(3, 'CONCILIADOR'),
	(4, 'NOTIFICADOR'),
	(5, 'DIRECTOR'),
	(8, 'ABOGADO'),
	(9, 'SECRETARIO');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
