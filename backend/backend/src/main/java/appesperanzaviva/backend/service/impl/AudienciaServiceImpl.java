package appesperanzaviva.backend.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import appesperanzaviva.backend.entity.Audiencia;
import appesperanzaviva.backend.entity.AudienciaClausula;
import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.repository.AudienciaClausulaRepository;
import appesperanzaviva.backend.repository.AudienciaRepository;
import appesperanzaviva.backend.repository.SolicitudRepository;
import appesperanzaviva.backend.service.AudienciaService;

@Service
@SuppressWarnings("boxing")
public class AudienciaServiceImpl implements AudienciaService {

    @Autowired
    private AudienciaRepository repository;
    
    @Autowired
    private AudienciaClausulaRepository clausulaRepo;
    
    @Autowired
    private SolicitudRepository solicitudRepository;

    @Override
    public List<Audiencia> listarPorConciliador(@NonNull Integer conciliadorId) {
        return repository.findBySolicitudConciliadorId(conciliadorId);
    }
    
    @Override
    public Audiencia obtenerPorId(@NonNull Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Audiencia programar(Audiencia audiencia) {
        Solicitud solicitud = audiencia.getSolicitud();
        if (solicitud == null || solicitud.getId() == null) {
            throw new RuntimeException("Error: La solicitud vinculada es nula.");
        }
        
        Solicitud solicitudDb = solicitudRepository.findById(solicitud.getId())
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada en MariaDB"));

        solicitudDb.setEstado("AUDIENCIA_PROGRAMADA");
        solicitudRepository.save(solicitudDb);

        return repository.save(audiencia);
    }

    @Override
    @Transactional
    public Audiencia registrarResultado(@NonNull Long id, Audiencia datos) {
        return repository.findById(id).map(a -> {
            // Mapeo de strings profesionales para el Formato D
            a.setAsistenciaSolicitante(datos.getAsistenciaSolicitante());
            a.setAsistenciaInvitado(datos.getAsistenciaInvitado());
            a.setResultadoTipo(datos.getResultadoTipo());
            a.setResultadoDetalle(datos.getResultadoDetalle());
            a.setAbogadoVerificador(datos.getAbogadoVerificador());

            Solicitud solicitud = a.getSolicitud();
            if (datos.getResultadoTipo() != null && datos.getResultadoTipo().contains("Acuerdo")) {
                solicitud.setEstado("PENDIENTE_ACTA");
            } else {
                solicitud.setEstado("CONCLUIDO_SIN_ACUERDO");
            }
            solicitudRepository.save(solicitud);

            return repository.save(a);
        }).orElseThrow(() -> new RuntimeException("Audiencia no encontrada con ID: " + id));
    }

    @Override
    @Transactional
    public Audiencia finalizar(@NonNull Long solicitudId, Audiencia datos) {
        Audiencia audiencia = repository.findBySolicitudId(solicitudId)
                .orElseThrow(() -> new RuntimeException("No hay audiencia para esta solicitud"));

        if (datos.getAbogadoVerificador() != null) {
            audiencia.setAbogadoVerificador(datos.getAbogadoVerificador());
        }

        Solicitud solicitud = audiencia.getSolicitud();
        solicitud.setEstado("CONCLUIDO");
        solicitud.setObservacion("Acta generada. " + datos.getResultadoDetalle());
        solicitudRepository.save(solicitud);

        return repository.save(audiencia);
    }

    @Override
    @Transactional
    public void guardarClausulas(@NonNull Long audienciaId, List<AudienciaClausula> clausulas) {
        Audiencia audiencia = repository.findById(audienciaId).orElseThrow();
        clausulas.forEach(c -> c.setAudiencia(audiencia));
        clausulaRepo.saveAll(clausulas);
    }

    @Override
    public Audiencia obtenerPorSolicitud(@NonNull Long solicitudId) {
        return repository.findBySolicitudId(solicitudId).orElse(null);
    }
}