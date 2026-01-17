package appesperanzaviva.backend.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.repository.SolicitudRepository;
import appesperanzaviva.backend.service.SolicitudService;

@Service
public class SolicitudServiceImpl implements SolicitudService {

    @Autowired
    private SolicitudRepository repository;

    @Autowired
    private appesperanzaviva.backend.repository.UsuarioSistemaRepository usuarioRepository;

    private final Path root = Paths.get("uploads");

    @Override
    public Solicitud crearSolicitudConArchivos(Solicitud solicitud, MultipartFile dni, MultipartFile pruebas,
            MultipartFile firma) {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            // Validar apoderado vacío (Limpia datos basura del JSON)
            if (solicitud.getApoderado() != null &&
                    (solicitud.getApoderado().getNombres() == null
                            || solicitud.getApoderado().getNombres().isEmpty())) {
                solicitud.setApoderado(null);
            }

            // Generar correlativo dinámico
            long count = repository.count() + 1;
            solicitud.setNumeroExpediente("EXP-2025-" + String.format("%06d", count));

            // Asegurar estado inicial
            if (solicitud.getEstado() == null) {
                solicitud.setEstado("PENDIENTE");
            }

            // El campo subMateria ya viene mapeado automáticamente por el Controller

            // Guardar archivos físicamente y setear URLs
            if (dni != null && !dni.isEmpty())
                solicitud.setDniArchivoUrl(guardarArchivo(dni));
            if (pruebas != null && !pruebas.isEmpty())
                solicitud.setPruebasArchivoUrl(guardarArchivo(pruebas));
            if (firma != null && !firma.isEmpty())
                solicitud.setFirmaArchivoUrl(guardarArchivo(firma));

            return repository.save(solicitud);

        } catch (IOException e) {
            throw new RuntimeException("Error en el sistema de archivos: " + e.getMessage());
        }
    }

    private String guardarArchivo(MultipartFile archivo) throws IOException {
        String nombreUnico = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
        Files.copy(archivo.getInputStream(), this.root.resolve(nombreUnico), StandardCopyOption.REPLACE_EXISTING);
        return nombreUnico;
    }

    @Override
    public List<Solicitud> listarTodas() {
        return repository.findAll();
    }

    @Override
    public Optional<Solicitud> buscarPorId(@NonNull Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Solicitud> buscarPorNumero(String numero) {
        return repository.findByNumeroExpediente(numero);
    }

    // 🔹 Implementación de actualización para el Director
    @Override
    public Solicitud actualizarEstado(@NonNull Long id, String nuevoEstado, String observacion) {
        return repository.findById(id).map(s -> {
            s.setEstado(nuevoEstado);
            s.setObservacion(observacion);
            return repository.save(s);
        }).orElseThrow(() -> new RuntimeException("Expediente no encontrado"));
    }

    @Override
    public Solicitud designarConciliador(@NonNull Long id, @NonNull Long conciliadorId) {
        Solicitud solicitud = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        appesperanzaviva.backend.entity.UsuarioSistema conciliador = usuarioRepository
                .findById(Math.toIntExact(conciliadorId))
                .orElseThrow(() -> new RuntimeException("Conciliador no encontrado"));

        solicitud.setConciliador(conciliador);
        solicitud.setEstado("ASIGNADO"); // Estado clave para que aparezca en la bandeja del conciliador

        return repository.save(solicitud);
    }

    @Override
    public List<Solicitud> listarPorConciliador(@NonNull Long conciliadorId) {
        return repository.findByConciliadorId(Math.toIntExact(conciliadorId));
    }
}