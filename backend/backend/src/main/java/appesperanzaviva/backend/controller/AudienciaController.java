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
@CrossOrigin(origins = "https://lucid-consideration-production.up.railway.app")
public class AudienciaController {

    @Autowired
    private AudienciaService service;

    @Autowired
    private appesperanzaviva.backend.service.AuditoriaService auditoriaService;

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

    @GetMapping("/notificador/{id}")
    public ResponseEntity<List<Audiencia>> listarPorNotificador(@PathVariable @NonNull Integer id) {
        List<Audiencia> lista = service.listarPorNotificador(id);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/programar")
    public ResponseEntity<Audiencia> programar(@RequestBody @NonNull Audiencia audiencia) {
        Audiencia programada = service.programar(audiencia);

        // AUDITORIA
        String fecha = (programada.getFechaAudiencia() != null) ? programada.getFechaAudiencia().toString()
                : "Sin fecha";
        String expedienteNo = (programada.getSolicitud() != null) ? programada.getSolicitud().getNumeroExpediente()
                : "N/A";

        auditoriaService.registrarAccion(
                "Conciliador/Director",
                "PROGRAMACION",
                "Audiencia programada para el " + fecha,
                expedienteNo);

        return ResponseEntity.ok(programada);
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<Audiencia> obtenerPorSolicitud(@PathVariable @NonNull Long id) {
        Audiencia a = service.obtenerPorSolicitud(id);
        return a != null ? ResponseEntity.ok(a) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<Audiencia> registrarResultado(@PathVariable @NonNull Long id,
            @RequestBody @NonNull Audiencia datos) {
        Audiencia registrada = service.registrarResultado(id, datos);

        // AUDITORIA
        String expedienteNo = (registrada.getSolicitud() != null) ? registrada.getSolicitud().getNumeroExpediente()
                : "N/A";

        auditoriaService.registrarAccion(
                "Conciliador",
                "RESULTADO",
                "Resultado registrado: " + registrada.getResultadoTipo(),
                expedienteNo);

        return ResponseEntity.ok(registrada);
    }

    @Autowired
    private appesperanzaviva.backend.service.PdfService pdfService;

    // 📄 PDF ENDPOINT: Descargar Acta Oficial
    @GetMapping(value = "/{id}/pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> descargarActa(@PathVariable @NonNull Long id) {
        try {
            Audiencia audiencia = service.obtenerPorId(id);
            if (audiencia == null)
                return ResponseEntity.notFound().build();

            byte[] pdfBytes = pdfService.generarActaConciliacion(audiencia);

            return ResponseEntity.ok()
                    .header("Content-Disposition",
                            "attachment; filename=Acta_" + audiencia.getSolicitud().getNumeroExpediente() + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
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