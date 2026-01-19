package appesperanzaviva.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

import appesperanzaviva.backend.entity.Solicitud;

public interface SolicitudService {
    // Registro completo con archivos
    Solicitud crearSolicitudConArchivos(Solicitud solicitud, MultipartFile dni, MultipartFile pruebas,
            MultipartFile firma);

    List<Solicitud> listarTodas();

    Optional<Solicitud> buscarPorId(@NonNull Long id); // 🔹 Útil para el detalle del director

    Optional<Solicitud> buscarPorNumero(String numero);

    // 🔹 Nuevo: Para aprobar/observar desde el panel del director
    Solicitud actualizarEstado(@NonNull Long id, String nuevoEstado, String observacion);

    // 🔹 Nuevo: Para designar conciliador
    Solicitud designarConciliador(@NonNull Long id, @NonNull Long conciliadorId);

    // 🔹 Nuevo: Listar por conciliador
    List<Solicitud> listarPorConciliador(@NonNull Long conciliadorId);

    // 🔹 NUEVO: Estado PENDIENTE para Director
    List<Solicitud> listarPorEstado(String estado);

    // 🔹 NUEVO: Estado // Listar por conciliador y estado
    List<Solicitud> listarPorConciliadorYEstado(Long conciliadorId, String estado);

    // Obtener carga laboral
    java.util.Map<Integer, Long> obtenerCargaLaboral();

    // 🔹 NUEVO: Obtener archivo
    org.springframework.core.io.Resource obtenerArchivo(@NonNull Long id, String tipo) throws java.io.IOException;
}