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

    @Autowired
    private appesperanzaviva.backend.repository.UsuarioSistemaRepository usuarioRepo;

    @Autowired
    private appesperanzaviva.backend.service.EmailService emailService;

    @Override
    public List<Audiencia> listarPorConciliador(@NonNull Integer conciliadorId) {
        return repository.findBySolicitudConciliadorId(conciliadorId);
    }

    @Override
    public List<Audiencia> listarPorNotificador(@NonNull Integer notificadorId) {
        return repository.findBySolicitudNotificadorId(notificadorId);
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

        solicitudDb.setEstado("PROGRAMADO");

        // 🔹 NUEVO: Guardar el notificador si se seleccionó en el frontend
        if (solicitud.getNotificador() != null && solicitud.getNotificador().getId() != null) {
            appesperanzaviva.backend.entity.UsuarioSistema notificadorDb = usuarioRepo
                    .findById(solicitud.getNotificador().getId())
                    .orElseThrow(() -> new RuntimeException("Notificador no encontrado"));
            solicitudDb.setNotificador(notificadorDb);
        }

        // 📧 EMAIL: Notificar a las partes (Mock o Real si está configurado)
        if (emailService != null) {
            String fecha = audiencia.getFechaAudiencia().toString();
            String hora = audiencia.getHoraAudiencia().toString();
            String lugar = audiencia.getLugar();

            // Enviar a Solicitante (asumiendo campo email existe o usando mock)
            if (solicitudDb.getSolicitante() != null && solicitudDb.getSolicitante().getCorreoElectronico() != null) {
                emailService.enviarNotificacionProgramacion(solicitudDb.getSolicitante().getCorreoElectronico(),
                        solicitudDb.getNumeroExpediente(), fecha, hora, lugar);
            }
            // Enviar a Invitado
            if (solicitudDb.getInvitado() != null && solicitudDb.getInvitado().getCorreoElectronico() != null) {
                emailService.enviarNotificacionProgramacion(solicitudDb.getInvitado().getCorreoElectronico(),
                        solicitudDb.getNumeroExpediente(), fecha, hora, lugar);
            }
        }

        // 🛡️ VALIDACIÓN MEJORADA: Evitar cruces de horario (Conciliador O Sala)
        if (solicitudDb.getConciliador() != null) {
            long cruces = repository.countByConciliadorOrLugarAndFechaHora(
                    solicitudDb.getConciliador().getId(),
                    audiencia.getLugar(), // Validar también el lugar
                    audiencia.getFechaAudiencia(),
                    audiencia.getHoraAudiencia());

            if (cruces > 0) {
                throw new RuntimeException(
                        "⚠️ CONFLICTO DE AGENDA: El Conciliador o la Sala (" + audiencia.getLugar()
                                + ") ya están ocupados en esa fecha y hora.");
            }
        }

        solicitudRepository.save(solicitudDb);

        // 🛡️ CRITICO: Asignar la solicitud gestionada (con el notificador actualizado)
        // a la audiencia
        // Si no hacemos esto, Hibernate podria usar el objeto parcial
        // 'audiencia.getSolicitud()'
        // y planchar los cambios o dejar el notificador nulo.
        audiencia.setSolicitud(solicitudDb);

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
            // 🔹 LOGIC FIX GLOBAL: Si hay URL de acta en el detalle, SIEMPRE va a firma del
            // abogado
            // (Sea Acuerdo, Inasistencia o Falta de Acuerdo)
            if (datos.getResultadoDetalle() != null && datos.getResultadoDetalle().contains("actaUrl")) {
                solicitud.setEstado("PENDIENTE_FIRMA");
            } else if (datos.getResultadoTipo() != null && datos.getResultadoTipo().contains("Acuerdo")) {
                solicitud.setEstado("PENDIENTE_ACTA"); // Acuerdo verbal pero falta subir PDF
            } else {
                solicitud.setEstado("CONCLUIDO_SIN_ACUERDO"); // Sin acta aún (o no requiere)
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