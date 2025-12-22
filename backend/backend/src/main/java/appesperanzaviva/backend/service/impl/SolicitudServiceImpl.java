package appesperanzaviva.backend.service.impl;

import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.repository.SolicitudRepository;
import appesperanzaviva.backend.service.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SolicitudServiceImpl implements SolicitudService {

    @Autowired
    private SolicitudRepository repository;

    // 🔹 Usamos Path para manejar rutas de forma más limpia
    private final Path root = Paths.get("uploads");

    @Override
    public Solicitud crearSolicitudConArchivos(Solicitud solicitud, MultipartFile dni, MultipartFile pruebas, MultipartFile firma) {
        try {

            // 1️⃣ Crear carpeta si no existe
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            // Validar si el apoderado viene vacío desde el frontend
            if (solicitud.getApoderado() != null &&
               (solicitud.getApoderado().getNombres() == null ||
                solicitud.getApoderado().getNombres().isEmpty())) {

                solicitud.setApoderado(null);
            }

            // Generar correlativo
            long count = repository.count() + 1;
            solicitud.setNumeroExpediente("EXP-2025-" + String.format("%06d", count));
            solicitud.setEstado("PENDIENTE");

            // Guardar archivos físicamente
            if (dni != null && !dni.isEmpty()) {
                solicitud.setDniArchivoUrl(guardarArchivo(dni));
            }

            if (pruebas != null && !pruebas.isEmpty()) {
                solicitud.setPruebasArchivoUrl(guardarArchivo(pruebas));
            }

            if (firma != null && !firma.isEmpty()) {
                solicitud.setFirmaArchivoUrl(guardarArchivo(firma));
            }

            // Guardar en la base de datos
            return repository.save(solicitud);

        } catch (IOException e) {
            throw new RuntimeException("Error al procesar archivos: " + e.getMessage());
        }
    }

    private String guardarArchivo(MultipartFile archivo) throws IOException {
        // 🔹 Generamos un nombre único
        String nombreUnico = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();

        Files.copy(
                archivo.getInputStream(),
                this.root.resolve(nombreUnico),
                StandardCopyOption.REPLACE_EXISTING
        );

        return nombreUnico;
    }

    @Override
    public List<Solicitud> listarTodas() {
        return repository.findAll();
    }

    @Override
    public Optional<Solicitud> buscarPorNumero(String numero) {
        return repository.findByNumeroExpediente(numero);
    }
}
