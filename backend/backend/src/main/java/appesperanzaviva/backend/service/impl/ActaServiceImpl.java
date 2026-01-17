package appesperanzaviva.backend.service.impl;

import appesperanzaviva.backend.entity.Acta;
import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.repository.ActaRepository;
import appesperanzaviva.backend.repository.AudienciaRepository;
import appesperanzaviva.backend.service.ActaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class ActaServiceImpl implements ActaService {

    @Autowired
    private ActaRepository actaRepository;

    @Autowired
    private AudienciaRepository audienciaRepository;

    private final Path fileStorageLocation;

    public ActaServiceImpl(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio de subida de archivos.", ex);
        }
    }

    @Override
    public Acta guardarActa(@org.springframework.lang.NonNull Long audienciaId, String tipoActa, String numeroActa,
            MultipartFile archivo) {
        Audiencia audiencia = audienciaRepository.findById(audienciaId)
                .orElseThrow(() -> new RuntimeException("Audiencia no encontrada"));

        // Guardar archivo físico
        String fileName = "ACTA_" + audienciaId + "_" + UUID.randomUUID().toString() + ".pdf";
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(archivo.getInputStream(), targetLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Error al guardar el archivo del acta", ex);
        }

        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        // Guardar o Actualizar Entidad Acta
        Acta acta = actaRepository.findByAudienciaId(audienciaId).orElse(new Acta());
        acta.setAudiencia(audiencia);
        acta.setNumeroActa(numeroActa);
        acta.setTipoActa(tipoActa);
        acta.setArchivoUrl(fileUrl);

        return actaRepository.save(acta);
    }

    @Override
    public Optional<Acta> obtenerPorAudiencia(Long audienciaId) {
        return actaRepository.findByAudienciaId(audienciaId);
    }
}
