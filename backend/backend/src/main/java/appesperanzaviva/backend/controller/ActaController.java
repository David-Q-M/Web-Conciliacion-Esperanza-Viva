package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Acta;
import appesperanzaviva.backend.service.ActaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/actas")
@CrossOrigin(origins = "https://lucid-consideration-production.up.railway.app", allowedHeaders = "*")
public class ActaController {

    @Autowired
    private ActaService actaService;

    @PostMapping("/upload")
    public ResponseEntity<Acta> subirActa(
            @RequestParam("audienciaId") Long audienciaId,
            @RequestParam("tipoActa") String tipoActa,
            @RequestParam("numeroActa") String numeroActa,
            @RequestParam("archivo") MultipartFile archivo) {

        Acta nuevaActa = actaService.guardarActa(audienciaId, tipoActa, numeroActa, archivo);
        return ResponseEntity.ok(nuevaActa);
    }

    @GetMapping("/audiencia/{id}")
    public ResponseEntity<Acta> obtenerPorAudiencia(@PathVariable Long id) {
        return actaService.obtenerPorAudiencia(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
