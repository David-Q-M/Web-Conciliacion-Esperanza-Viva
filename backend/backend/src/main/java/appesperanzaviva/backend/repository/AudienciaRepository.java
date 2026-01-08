package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Audiencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AudienciaRepository extends JpaRepository<Audiencia, Long> {
    // Buscar la audiencia ligada a una solicitud específica
    Optional<Audiencia> findBySolicitudId(Long solicitudId);
}