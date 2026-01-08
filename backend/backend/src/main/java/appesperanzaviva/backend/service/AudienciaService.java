package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.entity.AudienciaClausula;
import java.util.List;

public interface AudienciaService {
    Audiencia programar(Audiencia audiencia); // Formato C

    Audiencia registrarResultado(Long id, Audiencia datos); // Wireframes 61-64

    Audiencia finalizar(Long solicitudId, Audiencia datos); // 🔹 Nuevo: Para Generar Acta

    void guardarClausulas(Long audienciaId, List<AudienciaClausula> clausulas); // Wireframe 48

    Audiencia obtenerPorSolicitud(Long solicitudId);
}