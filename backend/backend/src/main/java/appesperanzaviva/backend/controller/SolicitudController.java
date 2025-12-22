package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.service.SolicitudService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class SolicitudController {

    @Autowired
    private SolicitudService service;

    // CORRECCIÓN PARA SUBIR ARCHIVOS (Wireframe-4)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Solicitud> registrar(
            @RequestPart("solicitud") String solicitudJson,
            @RequestPart(value = "dniArchivo", required = false) MultipartFile dni,
            @RequestPart(value = "pruebasArchivo", required = false) MultipartFile pruebas,
            @RequestPart(value = "firmaArchivo", required = false) MultipartFile firma) {
        
        try {
            // 1. Convertimos el texto JSON que viene de Angular a un objeto Solicitud
            ObjectMapper objectMapper = new ObjectMapper();
            Solicitud nuevaSolicitud = objectMapper.readValue(solicitudJson, Solicitud.class);

            // 2. Enviamos todo al servicio para procesar archivos y guardar en MariaDB
            Solicitud guardada = service.crearSolicitudConArchivos(nuevaSolicitud, dni, pruebas, firma);
            
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Para listar todas (Panel del Conciliador)
    @GetMapping
    public ResponseEntity<List<Solicitud>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }
    
    // Buscar para la consulta del ciudadano (Wireframe-1 -> Wireframe-5)
    @GetMapping("/buscar/{numero}")
    public ResponseEntity<Solicitud> buscarPorNumero(@PathVariable String numero) {
        return service.buscarPorNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}