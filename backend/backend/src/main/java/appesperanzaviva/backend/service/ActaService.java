package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Acta;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

public interface ActaService {
    Acta guardarActa(Long audienciaId, String tipoActa, String numeroActa, MultipartFile archivo);

    Optional<Acta> obtenerPorAudiencia(Long audienciaId);
}
