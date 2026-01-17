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

-- ==========================================
-- LIMPIEZA TOTAL (Orden correcto para FKs)
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audiencia_clausulas`;
DROP TABLE IF EXISTS `actas`;
DROP TABLE IF EXISTS `audiencias`;
DROP TABLE IF EXISTS `solicitudes`;
DROP TABLE IF EXISTS `usuario_roles`;
DROP TABLE IF EXISTS `configuracion_sistema`;
DROP TABLE IF EXISTS `auditoria`;
DROP TABLE IF EXISTS `personas`;
DROP TABLE IF EXISTS `usuarios_sistema`;
DROP TABLE IF EXISTS `usuarios`; -- Tabla Legacy eliminada
DROP TABLE IF EXISTS `roles`;    -- Tabla Legacy eliminada
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. TABLA PERSONAS
-- ==========================================
CREATE TABLE IF NOT EXISTS `personas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
	(32, 'quispe maucaylle', 'david@gmail.com', '74555592', 'av. cahuide sn', 'david', '966495094'),
	(33, 'quispe maucaylle', '234567@unamba.edu.pe', '12345678', 'av las gardenias', 'dassdsa', '966495094'),
	(34, 'quispe maucaylle', 'david@gmail.com', '12345675', 'av. Canada', 'david', '966495094');


-- ==========================================
-- 2. USUARIOS DEL SISTEMA
-- ==========================================
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

INSERT INTO `usuarios_sistema` (`id`, `nombre_completo`, `dni`, `telefono`, `direccion`, `correo_electronico`, `usuario`, `contrasena`, `rol`, `estado`, `fecha_registro`, `nro_colegiatura`, `nro_especializacion`, `nro_registro`) VALUES
	(2, 'David Quispe Maucaylle', '74555592', '966495094', 'Av. Principal 123', 'david@gmail.com', 'david', 'david', 'ADMINISTRADOR', 'ACTIVO', '2025-12-21', NULL, NULL, NULL),
	(3, 'Rut Coaquira Leo', '12233333', '986547222', 'Av. Canada', 'rut@gmail.com', 'rut123', 'rut123', 'CONCILIADOR', 'ACTIVO', '2025-12-22', NULL, NULL, '12323'),
	(4, 'Jamileth Cruz Llicahua', '12345678', '987654321', 'Calle Pinitos 456', 'jamileth@mail.com', 'jamileth', 'jamileth', 'CONCILIADOR', 'ACTIVO', '2025-12-22', NULL, NULL, '122222'),
	(5, 'director', '11111111', '987654321', 'AV. soles', 'dire@gmail.com', 'director', 'director', 'DIRECTOR', 'ACTIVO', '2025-12-28', NULL, NULL, NULL),
	(7, 'Juancito', '77777777', '986574321', 'abancay', 'Juancito@gmail.com', 'juancito', 'juancito', 'NOTIFICADOR', 'ACTIVO', '2026-01-07', '25478', NULL, NULL),
	(8, 'davicito', '77777777', '987653214', 'abancay', 'davicito@hotmail.com', 'davicito', 'davicito', 'ABOGADO', 'ACTIVO', '2026-01-09', '98354', '', '');


-- ==========================================
-- 3. USUARIO_ROLES (Requerido por Java @ElementCollection)
-- ==========================================
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` int(11) NOT NULL,
  `rol` varchar(255) DEFAULT NULL,
  KEY `FK_usuario_roles` (`usuario_id`),
  CONSTRAINT `FK_usuario_roles` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_sistema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `usuario_roles` (`usuario_id`, `rol`) VALUES
	(2, 'ADMINISTRADOR'),
	(3, 'CONCILIADOR'),
	(4, 'CONCILIADOR'),
	(5, 'DIRECTOR'),
	(7, 'NOTIFICADOR'),
	(8, 'ABOGADO'),
	(3, 'NOTIFICADOR'),
	(7, 'ABOGADO');


-- ==========================================
-- 4. SOLICITUDES
-- ==========================================
CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero_expediente` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `materia_conciliable` varchar(255) DEFAULT NULL,
  `sub_materia` varchar(255) DEFAULT NULL,
  `fecha_presentacion` datetime(6) DEFAULT NULL,
  `hechos` text DEFAULT NULL,
  `pretension` text DEFAULT NULL,
  `otras_personas_alimentario` text DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `modalidad` varchar(20) DEFAULT 'Presencial',
  
  -- Relaciones
  `solicitante_id` bigint(20) DEFAULT NULL,
  `invitado_id` bigint(20) DEFAULT NULL,
  `apoderado_id` bigint(20) DEFAULT NULL,
  `conciliador_id` int(11) DEFAULT NULL,
  `notificador_id` int(11) DEFAULT NULL,
  
  -- Archivos
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
  
  CONSTRAINT `FK_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FK_invitado` FOREIGN KEY (`invitado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FK_apoderado` FOREIGN KEY (`apoderado_id`) REFERENCES `personas` (`id`),
  CONSTRAINT `FK_conciliador` FOREIGN KEY (`conciliador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_notificador` FOREIGN KEY (`notificador_id`) REFERENCES `usuarios_sistema` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `solicitudes` (`id`, `estado`, `fecha_presentacion`, `hechos`, `materia_conciliable`, `numero_expediente`, `pretension`, `otras_personas_alimentario`, `invitado_id`, `solicitante_id`, `dni_archivo_url`, `pruebas_archivo_url`, `firma_archivo_url`, `observacion`, `apoderado_id`, `sub_materia`, `conciliador_id`, `modalidad`, `notificador_id`) VALUES
	(1, 'APROBADO', '2026-01-01 10:00:00.000000', 'Pensión de alimentos para menor.', 'FAMILIA', 'EXP-2026-001', '1000 soles mensuales.', NULL, 2, 1, NULL, NULL, NULL, '', NULL, NULL, 4, 'Presencial', NULL),
	(2, 'ASIGNADO', '2026-01-01 11:30:00.000000', 'Incumplimiento de contrato de alquiler.', 'CIVIL', 'EXP-2026-002', 'Desalojo y pago de meses.', NULL, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Presencial', NULL),
	(3, 'PENDIENTE', '2026-01-02 09:15:00.000000', 'Régimen de visitas.', 'FAMILIA', 'EXP-2026-003', 'Fines de semana.', NULL, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(4, 'PENDIENTE', '2026-01-02 15:45:00.000000', 'Deuda de dinero.', 'CIVIL', 'EXP-2026-004', 'Pago de 5000 soles.', NULL, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(5, 'DESIGNACION_ACEPTADA', '2026-01-03 08:00:00.000000', 'Tenencia de menor.', 'FAMILIA', 'EXP-2026-005', 'Tenencia compartida.', NULL, 10, 9, NULL, NULL, NULL, 'Ha aceptado el caso con éxito.', NULL, NULL, 3, 'Presencial', NULL),
	(6, 'ASIGNADO', '2026-01-04 10:00:00.000000', 'Indemnización por daños.', 'CIVIL', 'EXP-2026-006', 'Pago de daños en vehículo.', NULL, 12, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(7, 'ASIGNADO', '2026-01-04 12:00:00.000000', 'Aumento de pensión.', 'FAMILIA', 'EXP-2026-007', 'Subir a 800 soles.', NULL, 14, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(8, 'ASIGNADO', '2026-01-05 09:30:00.000000', 'Otorgamiento de escritura.', 'CIVIL', 'EXP-2026-008', 'Firma de documentos.', NULL, 16, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(9, 'ASIGNADO', '2026-01-05 14:00:00.000000', 'Gastos de embarazo.', 'FAMILIA', 'EXP-2026-009', 'Pago de gastos médicos.', NULL, 18, 17, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(10, 'ASIGNADO', '2026-01-06 11:00:00.000000', 'División y partición.', 'CIVIL', 'EXP-2026-010', 'Reparto de herencia.', NULL, 20, 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(11, 'DESIGNACION_ACEPTADA', '2026-01-01 10:00:00.000000', 'Reducción de alimentos.', 'FAMILIA', 'EXP-2026-011', 'Bajar a 300 soles.', NULL, 22, 21, NULL, NULL, NULL, 'Ha aceptado el caso con éxito.', NULL, NULL, 3, 'Presencial', NULL),
	(12, 'DESIGNACION_ACEPTADA', '2026-01-02 11:00:00.000000', 'Resolución de contrato.', 'CIVIL', 'EXP-2026-012', 'Anulación de compraventa.', NULL, 24, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(13, 'DESIGNACION_ACEPTADA', '2026-01-03 14:00:00.000000', 'Reconocimiento de unión de hecho.', 'FAMILIA', 'EXP-2026-013', 'Declaración legal.', NULL, 26, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(14, 'DESIGNACION_ACEPTADA', '2026-01-04 15:30:00.000000', 'Reivindicación.', 'CIVIL', 'EXP-2026-014', 'Recuperación de propiedad.', NULL, 28, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Presencial', NULL),
	(15, 'ASIGNADO', '2026-01-05 08:45:00.000000', 'Exoneración de alimentos.', 'FAMILIA', 'EXP-2026-015', 'Cese de pago por mayoría de edad.', NULL, 30, 29, NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Presencial', NULL),
	(16, 'DESIGNACION_ACEPTADA', '2026-01-09 22:17:43.802164', 'incumplimiento de trabajo de jordana en la obra, y sin justificacion', 'CIVIL', 'EXP-2025-000016', 'quiero que ya no trabaje y que me pague 4000 soles por el tiempo de perdida', '', 31, 32, 'cbb618a3-2ee8-4a0e-84e6-2520ad8b9e15_WhatsApp Image 2026-01-09 at 7.42.28 PM.jpeg', '9317076c-8ada-4a77-8f5b-023acfd4b490_WhatsApp Image 2026-01-08 at 3.48.50 AM.jpeg', '7fee9c13-70de-478a-8bfb-da77d83fb185_Formato_A_74555592.doc', 'Ha aceptado el caso con éxito.', NULL, 'Incumplimiento de contrato', 3, 'Presencial', NULL),
	(17, 'PENDIENTE', '2026-01-14 19:11:27.914656', 'shjklñsaa  jsnj  aj skdjkjk abskj kj nkjan ans lsdnkj   a', 'FAMILIA', 'EXP-2025-000017', 'saf a   ajshbdhfbdsj kj ajshfb', 'sd ad kjak ja s dkjm kajshjnsbfkjbdkbbdjb kjdb s dfbsh ', 33, 34, '149a711c-270f-4e65-a77a-d2194bee937d_Captura de pantalla 2025-10-07 183906.png', NULL, '05ed64d8-1da3-4880-be55-1e857c92cafc_Formato_A_12345675 (1).pdf', NULL, NULL, 'Pensión de alimentos a favor de conviviente', NULL, 'Presencial', NULL);


-- ==========================================
-- 5. AUDIENCIAS
-- ==========================================
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
  -- UNIQUE KEY `UK_solicitud` (`solicitud_id`), -- DESACTIVADO PARA PERMITIR REPROGRAMACIONES (Backend lo soporta)
  KEY `FK_audiencia_solicitud` (`solicitud_id`),
  KEY `FK_audiencia_abogado` (`abogado_verificador_id`),
  CONSTRAINT `FK_audiencia_abogado` FOREIGN KEY (`abogado_verificador_id`) REFERENCES `usuarios_sistema` (`id`),
  CONSTRAINT `FK_audiencia_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `audiencias` (`id`, `solicitud_id`, `fecha_audiencia`, `hora_audiencia`, `lugar`, `asistencia_solicitante`, `asistencia_invitado`, `resultado_tipo`, `resultado_detalle`, `abogado_verificador_id`, `fecha_registro`) VALUES
	(2, 12, '2026-01-10', '11:00:00', 'Sala B', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(3, 13, '2026-01-11', '10:00:00', 'Sala Virtual', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(4, 14, '2026-01-12', '15:00:00', 'Sala A', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(5, 15, '2026-01-13', '10:30:00', 'Sala B', '0', '0', NULL, NULL, NULL, '2026-01-07 23:56:04'),
	(11, 1, '2026-02-12', '22:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'No asistio', 'No asistio', 'Suspension', 'Suspension', NULL, '2026-01-08 21:17:24'),
	(12, 16, '2026-01-20', '11:22:00', 'Av. Sol 450 - Cusco (Sede Principal)', NULL, NULL, 'Acuerdo Parcial', '{"hechos":"incumplimiento de trabajo de jordana en la obra, y sin justificacion","controversia":"","puntosSinAcuerdo":"","abogadoVerificador":"","lugarAudiencia":"Av. Sol 450 - Cusco","solicitanteDireccion":"av. cahuide sn","invitadoDireccion":"av. Las Intimpas","conciliadorDni":"12233333","conciliadorRegistro":"12323","conciliadorEspecialidad":"","acuerdos":[{"titulo":"PRIMERO","contenido":""},{"titulo":"SEGUNDO","contenido":""}]}', NULL, '2026-01-09 23:21:48'),
	(15, 11, '2026-01-15', '20:17:00', 'Av. Sol 450 - Cusco (Sede Principal)', 'Asistio', 'Asistio', 'Falta de Acuerdo', 'Falta de acuerdo con posiciones y/o propuestas', NULL, '2026-01-14 18:17:24');


-- ==========================================
-- 6. ACTAS
-- ==========================================
CREATE TABLE IF NOT EXISTS `actas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `archivo_url` text DEFAULT NULL,
  `fecha_generacion` datetime(6) DEFAULT NULL,
  `numero_acta` varchar(255) DEFAULT NULL,
  `tipo_acta` varchar(255) DEFAULT NULL,
  `audiencia_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_audiencia_acta` (`audiencia_id`),
  UNIQUE KEY `UK_numero_acta` (`numero_acta`),
  CONSTRAINT `FK_acta_audiencia` FOREIGN KEY (`audiencia_id`) REFERENCES `audiencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


-- ==========================================
-- 7. AUDIENCIA CLAUSULAS
-- ==========================================
CREATE TABLE IF NOT EXISTS `audiencia_clausulas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `audiencia_id` bigint(20) NOT NULL,
  `orden` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_clausula_audiencia` (`audiencia_id`),
  CONSTRAINT `FK_clausula_audiencia` FOREIGN KEY (`audiencia_id`) REFERENCES `audiencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


-- ==========================================
-- 8. CONFIGURACION Y AUDITORIA
-- ==========================================
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `categoria` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `configuracion_sistema` (`id`, `clave`, `valor`, `categoria`) VALUES
	(1, 'estado_1', 'Pendiente', 'ESTADO'),
	(2, 'estado_2', 'Asignado', 'ESTADO'),
	(3, 'estado_3', 'Finalizado', 'ESTADO'),
	(4, 'materia_1', 'Familiar', 'MATERIA'),
	(5, 'materia_2', 'Civil', 'MATERIA'),
	(6, 'motivo_rechazo_1', 'No cumple requisitos', 'RECHAZO');

CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `usuario_nombre` varchar(150) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `expediente_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
