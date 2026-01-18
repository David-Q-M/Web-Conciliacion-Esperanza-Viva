package appesperanzaviva.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar la carpeta de almacenamiento", e);
        }
    }

    public String almacenarArchivo(MultipartFile file, String numeroExpediente, String tipoDocumento) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Error: Archivo vacío");
            }

            // Sanitizar nombre
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generar nombre estructurado: EXP-202X-XXX_TIPO_TIMESTAMP.pdf
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String nuevoNombre = "EXP-" + sanitize(numeroExpediente) + "_" + tipoDocumento + "_" + timestamp
                    + extension;

            Files.copy(file.getInputStream(), this.rootLocation.resolve(nuevoNombre),
                    StandardCopyOption.REPLACE_EXISTING);

            return nuevoNombre;
        } catch (IOException e) {
            throw new RuntimeException("Fallo al guardar archivo " + file.getOriginalFilename(), e);
        }
    }

    private String sanitize(String input) {
        return input.replaceAll("[^a-zA-Z0-9]", "-");
    }

    public Path cargar(String filename) {
        return rootLocation.resolve(filename);
    }
}
