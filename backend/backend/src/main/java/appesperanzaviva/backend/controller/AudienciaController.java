package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.service.AudienciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audiencias")
@CrossOrigin(origins = "http://localhost:4200")
public class AudienciaController {

    @Autowired
    private AudienciaService service;

    // 🛡️ ENDPOINT PARA REGISTRO DE AUDIENCIA (Wireframe 61)
    @GetMapping("/{id}")
    public ResponseEntity<Audiencia> obtenerPorId(@PathVariable @NonNull Long id) {
        Audiencia a = service.obtenerPorId(id); 
        return a != null ? ResponseEntity.ok(a) : ResponseEntity.notFound().build();
    }

    @GetMapping("/conciliador/{id}")
    public ResponseEntity<List<Audiencia>> listarPorConciliador(@PathVariable @NonNull Integer id) {
        List<Audiencia> lista = service.listarPorConciliador(id);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/programar")
    public ResponseEntity<Audiencia> programar(@RequestBody @NonNull Audiencia audiencia) {
        return ResponseEntity.ok(service.programar(audiencia));
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<Audiencia> obtenerPorSolicitud(@PathVariable @NonNull Long id) {
        Audiencia a = service.obtenerPorSolicitud(id);
        return a != null ? ResponseEntity.ok(a) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<Audiencia> registrarResultado(@PathVariable @NonNull Long id, @RequestBody @NonNull Audiencia datos) {
        return ResponseEntity.ok(service.registrarResultado(id, datos));
    }

    @PostMapping("/finalizar")
    public ResponseEntity<Audiencia> finalizar(@RequestBody Map<String, Object> payload) {
        Object solicitudObj = payload.get("solicitudId");
        Long solicitudId = null;

        if (solicitudObj instanceof Number) {
            solicitudId = ((Number) solicitudObj).longValue();
        } else if (solicitudObj instanceof String) {
            solicitudId = Long.parseLong((String) solicitudObj);
        }

        if (solicitudId == null) {
            return ResponseEntity.badRequest().build();
        }

        Audiencia datos = new Audiencia();
        return ResponseEntity.ok(service.finalizar(solicitudId, datos));
    }
}