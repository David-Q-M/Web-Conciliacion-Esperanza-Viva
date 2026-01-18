package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.service.SolicitudService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudController.class);

    @Autowired
    private SolicitudService service;

    @Autowired
    private appesperanzaviva.backend.service.AuditoriaService auditoriaService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Solicitud> registrar(
            @RequestPart("solicitud") String solicitudJson,
            @RequestPart(value = "dniArchivo", required = false) MultipartFile dni,
            @RequestPart(value = "pruebasArchivo", required = false) MultipartFile pruebas,
            @RequestPart(value = "firmaArchivo", required = false) MultipartFile firma) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Solicitud nuevaSolicitud = objectMapper.readValue(solicitudJson, Solicitud.class);
            Solicitud guardada = service.crearSolicitudConArchivos(nuevaSolicitud, dni, pruebas, firma);

            // AUDITORIA
            auditoriaService.registrarAccion(
                    "Usuario Web",
                    "REGISTRO",
                    "Nueva solicitud ingresada: " + guardada.getNumeroExpediente(),
                    guardada.getNumeroExpediente());

            return ResponseEntity.ok(guardada);
        } catch (IOException e) {
            logger.error("Error procesando solicitud", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<appesperanzaviva.backend.dto.SolicitudDTO>> listar() {
        try {
            List<Solicitud> lista = service.listarTodas();
            List<appesperanzaviva.backend.dto.SolicitudDTO> dtos = lista.stream().map(s -> {
                appesperanzaviva.backend.dto.SolicitudDTO dto = new appesperanzaviva.backend.dto.SolicitudDTO();
                dto.setId(s.getId());
                dto.setNumeroExpediente(s.getNumeroExpediente());
                dto.setEstado(s.getEstado());
                dto.setFechaPresentacion(s.getFechaPresentacion());
                dto.setMateriaConciliable(s.getMateriaConciliable());
                dto.setSubMateria(s.getSubMateria());

                // Mapeo seguro de nombres
                // Mapeo seguro de nombres y DNI
                if (s.getSolicitante() != null) {
                    dto.setSolicitanteNombre(s.getSolicitante().getNombres() + " " + s.getSolicitante().getApellidos());
                    dto.setSolicitanteDni(s.getSolicitante().getDni());
                }
                if (s.getInvitado() != null) {
                    dto.setInvitadoNombre(s.getInvitado().getNombres() + " " + s.getInvitado().getApellidos());
                    dto.setInvitadoDni(s.getInvitado().getDni());
                }
                if (s.getApoderado() != null) {
                    dto.setApoderadoNombre(s.getApoderado().getNombres() + " " + s.getApoderado().getApellidos());
                    dto.setApoderadoDni(s.getApoderado().getDni());
                }
                if (s.getConciliador() != null) {
                    dto.setConciliadorNombre(s.getConciliador().getNombreCompleto());
                    dto.setConciliadorId(s.getConciliador().getId().longValue());
                }
                if (s.getNotificador() != null) {
                    dto.setNotificadorNombre(s.getNotificador().getNombreCompleto());
                }
                if (s.getSecretario() != null) {
                    dto.setSecretarioNombre(s.getSecretario().getNombreCompleto());
                }

                // Resultado de audiencia (Tomamos la última registrada si hay varias)
                if (s.getAudiencias() != null && !s.getAudiencias().isEmpty()) {
                    appesperanzaviva.backend.entity.Audiencia ultimaAudiencia = s.getAudiencias()
                            .get(s.getAudiencias().size() - 1);
                    dto.setFechaAudiencia(ultimaAudiencia.getFechaAudiencia());
                    dto.setResultadoTipo(ultimaAudiencia.getResultadoTipo());
                }

                return dto;
            }).collect(java.util.stream.Collectors.toList());

            System.out.println("DEBUG - Enviando " + dtos.size() + " solicitudes como DTOs.");
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error al listar solicitudes (DTO Serialization): ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🔹 NUEVO: Obtener detalle por ID (Para el panel del director:
    // director/detalle/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable @NonNull Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar/{numero}")
    public ResponseEntity<Solicitud> buscarPorNumero(@PathVariable String numero) {
        return service.buscarPorNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 NUEVO: Actualizar estado y observaciones (Para aprobar/observar/rechazar)
    @PutMapping("/{id}/estado")
    public ResponseEntity<Solicitud> actualizarEstado(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, String> payload) {

        try {
            String nuevoEstado = payload.get("estado");
            String observacion = payload.get("observacion");
            Solicitud actualizada = service.actualizarEstado(id, nuevoEstado, observacion);

            // AUDITORIA
            auditoriaService.registrarAccion(
                    "Director/Sistema",
                    "ACTUALIZACION",
                    "Estado actualizado a " + nuevoEstado + (observacion != null ? " (Obs: " + observacion + ")" : ""),
                    actualizada.getNumeroExpediente());

            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🔹 NUEVO: Asignar conciliador (Para el Director - Wireframe 19/20)
    @PostMapping("/{id}/designar")
    public ResponseEntity<Solicitud> designarConciliador(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> payload) {

        try {
            Object obj = payload.get("conciliadorId");
            Long conciliadorId = null;
            if (obj instanceof Number) {
                conciliadorId = ((Number) obj).longValue();
            } else if (obj instanceof String) {
                conciliadorId = Long.parseLong((String) obj);
            }

            if (conciliadorId == null) {
                return ResponseEntity.badRequest().build();
            }

            Solicitud actualizada = service.designarConciliador(id, conciliadorId);

            // AUDITORIA
            String nombreConciliador = (actualizada.getConciliador() != null)
                    ? actualizada.getConciliador().getNombreCompleto()
                    : "Desconocido";
            auditoriaService.registrarAccion(
                    "Director",
                    "ASIGNACION",
                    "Se designó al conciliador: " + nombreConciliador,
                    actualizada.getNumeroExpediente());

            return ResponseEntity.ok(actualizada);
        } catch (NumberFormatException | NullPointerException e) {
            logger.error("Error designando conciliador", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // 🔹 NUEVO: Obtener solicitudes por conciliador
    @GetMapping("/conciliador/{conciliadorId}")
    public ResponseEntity<List<Solicitud>> listarPorConciliador(@PathVariable @NonNull Long conciliadorId) {
        return ResponseEntity.ok(service.listarPorConciliador(conciliadorId));
    }

    // 🔹 NUEVO: Endpoint para el Director (PENDIENTES)
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Solicitud>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(service.listarPorEstado(estado));
    }

    // 🔹 NUEVO: Endpoint para el Conciliador (ASIGNADOS)
    @GetMapping("/conciliador/{id}/estado/{estado}")
    public ResponseEntity<List<Solicitud>> listarPorConciliadorYEstado(@PathVariable Long id,
            @PathVariable String estado) {
        return ResponseEntity.ok(service.listarPorConciliadorYEstado(id, estado));
    }
}
