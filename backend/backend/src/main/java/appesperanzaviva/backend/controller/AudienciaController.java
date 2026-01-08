package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.service.AudienciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audiencias")
@CrossOrigin(origins = "http://localhost:4200")
public class AudienciaController {

    @Autowired
    private AudienciaService service;

    @PostMapping("/programar")
    public ResponseEntity<Audiencia> programar(@RequestBody Audiencia audiencia) {
        return ResponseEntity.ok(service.programar(audiencia));
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<Audiencia> obtener(@PathVariable Long id) {
        Audiencia a = service.obtenerPorSolicitud(id);
        return a != null ? ResponseEntity.ok(a) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<Audiencia> registrarResultado(@PathVariable Long id, @RequestBody Audiencia datos) {
        return ResponseEntity.ok(service.registrarResultado(id, datos));
    }

    @PostMapping("/finalizar")
    public ResponseEntity<Audiencia> finalizar(@RequestBody java.util.Map<String, Object> payload) {
        // Mapeo manual simple para este caso rápido
        Long solicitudId = Long.valueOf(payload.get("solicitudId").toString());

        Audiencia datos = new Audiencia();
        // Podríamos mapear más datos si fuera necesario

        // Guardar cláusulas si vienen
        if (payload.containsKey("clausulas")) {
            // Lógica de clausulas sería ideal aquí
        }

        return ResponseEntity.ok(service.finalizar(solicitudId, datos));
    }
}