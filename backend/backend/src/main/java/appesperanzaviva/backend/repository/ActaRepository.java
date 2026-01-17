package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Acta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActaRepository extends JpaRepository<Acta, Long> {
    Optional<Acta> findByAudienciaId(Long audienciaId);

    Optional<Acta> findByNumeroActa(String numeroActa);
}
