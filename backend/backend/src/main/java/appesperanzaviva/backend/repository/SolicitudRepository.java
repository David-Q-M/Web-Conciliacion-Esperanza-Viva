package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    Optional<Solicitud> findByNumeroExpediente(String numeroExpediente);
    
}