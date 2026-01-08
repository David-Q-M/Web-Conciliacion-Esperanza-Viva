package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.service.SolicitudService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
// Se añaden los métodos PUT y OPTIONS para que Angular pueda actualizar estados
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.OPTIONS })
public class SolicitudController {

    @Autowired
    private SolicitudService service;

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
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Solicitud>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    // 🔹 NUEVO: Obtener detalle por ID (Para el panel del director:
    // director/detalle/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable Long id) {
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
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        try {
            String nuevoEstado = payload.get("estado");
            String observacion = payload.get("observacion");
            Solicitud actualizada = service.actualizarEstado(id, nuevoEstado, observacion);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🔹 NUEVO: Asignar conciliador (Para el Director - Wireframe 19/20)
    @PostMapping("/{id}/designar")
    public ResponseEntity<Solicitud> designarConciliador(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        try {
            Long conciliadorId = Long.valueOf(payload.get("conciliadorId").toString());
            Solicitud actualizada = service.designarConciliador(id, conciliadorId);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🔹 NUEVO: Obtener solicitudes por conciliador
    @GetMapping("/conciliador/{conciliadorId}")
    public ResponseEntity<List<Solicitud>> listarPorConciliador(@PathVariable Long conciliadorId) {
        return ResponseEntity.ok(service.listarPorConciliador(conciliadorId));
    }
}
