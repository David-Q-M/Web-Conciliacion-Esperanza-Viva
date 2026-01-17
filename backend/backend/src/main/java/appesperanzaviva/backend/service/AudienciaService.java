package appesperanzaviva.backend.service;

import java.util.List;
import org.springframework.lang.NonNull;
import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.entity.AudienciaClausula;

public interface AudienciaService {

    // 🛡️ FUNDAMENTAL: Para mostrar los datos en la Agenda (Wireframe 57)
    List<Audiencia> listarPorConciliador(@NonNull Integer conciliadorId);

    // 📬 Para la bandeja del notificador
    List<Audiencia> listarPorNotificador(@NonNull Integer notificadorId);

    // 🗓️ Para guardar el Formato C (Wireframe 41)
    Audiencia programar(Audiencia audiencia);

    // ✅ Para registrar asistencia y resultados (Wireframes 61-64)
    Audiencia registrarResultado(@NonNull Long id, Audiencia datos);

    // 📝 Para el cierre total y generación de Formato D
    Audiencia finalizar(@NonNull Long solicitudId, Audiencia datos);

    // ⚖️ Para las estipulaciones del acta (Wireframe 48)
    void guardarClausulas(@NonNull Long audienciaId, List<AudienciaClausula> clausulas);

    Audiencia obtenerPorSolicitud(@NonNull Long solicitudId);

    Audiencia obtenerPorId(@NonNull Long id);
}