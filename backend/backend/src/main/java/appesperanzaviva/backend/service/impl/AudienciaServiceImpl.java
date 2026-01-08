package appesperanzaviva.backend.service.impl;

import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.entity.AudienciaClausula;
import appesperanzaviva.backend.repository.AudienciaRepository;
import appesperanzaviva.backend.repository.AudienciaClausulaRepository;
import appesperanzaviva.backend.service.AudienciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AudienciaServiceImpl implements AudienciaService {

    @Autowired
    private AudienciaRepository repository;
    @Autowired
    private AudienciaClausulaRepository clausulaRepo;
    @Autowired
    private appesperanzaviva.backend.repository.SolicitudRepository solicitudRepository; // 🔹 Inyectamos
                                                                                         // SolicitudRepository

    @Override
    @Transactional
    public Audiencia programar(Audiencia audiencia) {
        // 🔹 Actualizamos estado de la solicitud
        appesperanzaviva.backend.entity.Solicitud solicitud = solicitudRepository
                .findById(audiencia.getSolicitud().getId())
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstado("AUDIENCIA_PROGRAMADA");
        solicitudRepository.save(solicitud);

        return repository.save(audiencia);
    }

    @Override
    @Transactional
    public Audiencia registrarResultado(Long id, Audiencia datos) {
        return repository.findById(id).map(a -> {
            a.setAsistenciaSolicitante(datos.getAsistenciaSolicitante());
            a.setAsistenciaInvitado(datos.getAsistenciaInvitado());
            a.setResultadoTipo(datos.getResultadoTipo());
            a.setResultadoDetalle(datos.getResultadoDetalle());
            a.setAbogadoVerificador(datos.getAbogadoVerificador());

            // 🔹 Actualizmos estado según resultado
            appesperanzaviva.backend.entity.Solicitud solicitud = a.getSolicitud();
            if ("Acuerdo Total".equals(datos.getResultadoTipo())) {
                solicitud.setEstado("PENDIENTE_ACTA");
            } else {
                solicitud.setEstado("CONCLUIDO_SIN_ACUERDO"); // O el estado que prefieras
            }
            solicitudRepository.save(solicitud);

            return repository.save(a);
        }).orElseThrow(() -> new RuntimeException("Audiencia no encontrada"));
    }

    @Override
    @Transactional
    public Audiencia finalizar(Long solicitudId, Audiencia datos) {
        // 🔹 Lógica para finalizar y generar acta
        Audiencia audiencia = repository.findBySolicitudId(solicitudId)
                .orElseThrow(() -> new RuntimeException("No hay audiencia para esta solicitud"));

        // Actualizamos datos finales si vienen (ej. abogado verificador si no se puso
        // antes)
        if (datos.getAbogadoVerificador() != null) {
            audiencia.setAbogadoVerificador(datos.getAbogadoVerificador());
        }

        // Si hay cláusulas en el objeto datos, las guardamos
        // Nota: Esto depende de cómo el controller reciba las cláusulas.
        // Asumiremos que se manejan aparte o aquí si el DTO tuviera relación.
        // Por simplicidad, solo actualizamos estado del caso.

        appesperanzaviva.backend.entity.Solicitud solicitud = audiencia.getSolicitud();
        solicitud.setEstado("CONCLUIDO");
        solicitud.setObservacion("Acta generada. " + datos.getResultadoDetalle());
        solicitudRepository.save(solicitud);

        return repository.save(audiencia);
    }

    @Override
    @Transactional
    public void guardarClausulas(Long audienciaId, List<AudienciaClausula> clausulas) {
        // Limpiamos cláusulas anteriores si existen y guardamos las nuevas
        Audiencia audiencia = repository.findById(audienciaId).orElseThrow();
        clausulas.forEach(c -> c.setAudiencia(audiencia));
        clausulaRepo.saveAll(clausulas);
    }

    @Override
    public Audiencia obtenerPorSolicitud(Long solicitudId) {
        return repository.findBySolicitudId(solicitudId).orElse(null);
    }
}