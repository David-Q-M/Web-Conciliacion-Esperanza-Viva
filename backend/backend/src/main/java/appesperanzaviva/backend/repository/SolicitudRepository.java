package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

        // Para buscar expedientes por su código EXP-2025-XXXXXX
        // 🔹 NUEVO: Query con JOIN FETCH para cargar todos los datos requeridos por el
        // panel de consulta (evita LazyInitializationException y datos vacíos)
        @org.springframework.data.jpa.repository.Query("SELECT s FROM Solicitud s " +
                        "LEFT JOIN FETCH s.solicitante " +
                        "LEFT JOIN FETCH s.invitado " +
                        "LEFT JOIN FETCH s.conciliador " +
                        "LEFT JOIN FETCH s.notificador " +
                        "LEFT JOIN FETCH s.audiencias " +
                        "WHERE s.numeroExpediente = :numeroExpediente")
        Optional<Solicitud> findByNumeroExpediente(
                        @org.springframework.data.repository.query.Param("numeroExpediente") String numeroExpediente);

        // Para las barras de progreso del panel de reportes
        long countByEstado(String estado);

        // 🔹 NUEVO: Buscar solicitudes asignadas a un conciliador especifico
        java.util.List<Solicitud> findByConciliadorId(Integer conciliadorId);

        // 🔹 NUEVO: Buscar solicitudes asignadas a un conciliador con ESTADO especifico
        // (ASIGNADO para Conciliador)
        java.util.List<Solicitud> findByConciliadorIdAndEstado(Integer conciliadorId, String estado);

        // 🔹 NUEVO: Buscar por ESTADO (PENDIENTE para Director)
        // 🔹 NUEVO: Buscar por ESTADO (PENDIENTE para Director)
        java.util.List<Solicitud> findByEstado(String estado);

        // 🔹 NUEVO: Carga laboral por Conciliador (Para Dashboard Director)
        // Retorna lista de [ConciliadorId, Cantidad]
        @org.springframework.data.jpa.repository.Query("SELECT s.conciliador.id, COUNT(s) FROM Solicitud s " +
                        "WHERE s.conciliador IS NOT NULL AND s.estado NOT IN ('FINALIZADA', 'CONCLUIDO_SIN_ACUERDO', 'CONCILIADA') "
                        +
                        "GROUP BY s.conciliador.id")
        java.util.List<Object[]> countCargaLaboralPorConciliador();
}