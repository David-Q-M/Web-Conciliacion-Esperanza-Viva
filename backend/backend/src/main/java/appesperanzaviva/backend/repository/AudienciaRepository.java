package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Audiencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AudienciaRepository extends JpaRepository<Audiencia, Long> {

    // Buscar la audiencia ligada a una solicitud específica
    Optional<Audiencia> findBySolicitudId(Long solicitudId);

    List<Audiencia> findBySolicitudConciliadorId(Integer id);

    // 🔹 NUEVO: Buscar audiencias para un notificador específico (Query Explícito +
    // Eager Load)
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Audiencia a JOIN FETCH a.solicitud s LEFT JOIN FETCH s.solicitante LEFT JOIN FETCH s.invitado WHERE s.notificador.id = :id")
    List<Audiencia> findBySolicitudNotificadorId(
            @org.springframework.web.bind.annotation.PathVariable("id") Integer id);
}