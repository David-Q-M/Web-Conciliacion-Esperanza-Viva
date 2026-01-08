package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.AudienciaClausula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AudienciaClausulaRepository extends JpaRepository<AudienciaClausula, Long> {
    List<AudienciaClausula> findByAudienciaIdOrderByOrdenAsc(Long audienciaId);
}