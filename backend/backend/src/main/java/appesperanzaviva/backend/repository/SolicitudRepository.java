package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    // Para buscar expedientes por su código EXP-2025-XXXXXX
    Optional<Solicitud> findByNumeroExpediente(String numeroExpediente);

    // Para las barras de progreso del panel de reportes
    long countByEstado(String estado);

    // 🔹 NUEVO: Buscar solicitudes asignadas a un conciliador especifico
    java.util.List<Solicitud> findByConciliadorId(Integer conciliadorId);
}