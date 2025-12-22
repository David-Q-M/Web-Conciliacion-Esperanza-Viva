package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Solicitud;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

public interface SolicitudService {
    // Método principal para el registro completo con archivos
    Solicitud crearSolicitudConArchivos(Solicitud solicitud, MultipartFile dni, MultipartFile pruebas, MultipartFile firma);
    
    List<Solicitud> listarTodas();
    
    Optional<Solicitud> buscarPorNumero(String numero);
}