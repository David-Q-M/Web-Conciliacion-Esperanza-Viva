package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Audiencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface AudienciaRepository extends JpaRepository<Audiencia, Long> {

        // Buscar la audiencia ligada a una solicitud específica
        Optional<Audiencia> findBySolicitudId(Long solicitudId);

        List<Audiencia> findBySolicitudConciliadorId(Integer id);

        // 🔹 NUEVO: Buscar audiencias para un notificador específico (Sin filtrar
        // estado para ver historial)
        @org.springframework.data.jpa.repository.Query("SELECT a FROM Audiencia a JOIN FETCH a.solicitud s LEFT JOIN FETCH s.solicitante LEFT JOIN FETCH s.invitado WHERE s.notificador.id = :id")
        List<Audiencia> findBySolicitudNotificadorId(
                        @Param("id") Integer id);

        // 🛡️ VALIDACIÓN FECHAS: Contar si ya existe una audiencia para este
        // conciliador en esa fecha y hora
        // 🛡️ VALIDACIÓN FECHAS MEJORADA: Conciliador ocupado O Sala ocupada
        @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Audiencia a JOIN a.solicitud s " +
                        "WHERE a.fechaAudiencia = :fecha AND a.horaAudiencia = :hora " +
                        "AND (s.conciliador.id = :conciliadorId OR a.lugar = :lugar)")
        long countByConciliadorOrLugarAndFechaHora(
                        @Param("conciliadorId") Integer conciliadorId,
                        @Param("lugar") String lugar,
                        @Param("fecha") java.time.LocalDate fecha,
                        @Param("hora") java.time.LocalTime hora);
}