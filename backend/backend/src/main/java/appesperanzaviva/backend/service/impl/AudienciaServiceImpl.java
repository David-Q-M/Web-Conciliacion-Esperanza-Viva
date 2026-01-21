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

        // 1. Obtener la solicitud real de la BD
        Solicitud solicitudDb = solicitudRepository.findById(solicitud.getId())
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada en MariaDB"));

        // 🛡️ BLOQUEO DE SEGURIDAD: Evitar duplicidad si ya está programado
        if ("PROGRAMADO".equals(solicitudDb.getEstado())) {
            throw new RuntimeException("ERROR: Este expediente ya cuenta con una audiencia programada.");
        }

        System.out.println("DEBUG: Cambiando estado de Solicitud " + solicitudDb.getId() + " a PROGRAMADO");

        // 2. ACTUALIZAR ESTADO: Forzamos la actualización
        solicitudDb.setEstado("PROGRAMADO");
        solicitudRepository.saveAndFlush(solicitudDb); // FORCE FLUSH

        if (solicitud.getNotificador() != null && solicitud.getNotificador().getId() != null) {
            appesperanzaviva.backend.entity.UsuarioSistema notificadorDb = usuarioRepo
                    .findById(solicitud.getNotificador().getId())
                    .orElseThrow(() -> new RuntimeException("Notificador no encontrado"));
            solicitudDb.setNotificador(notificadorDb);
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

        // 4. (Ya guardado con flush arriba)
        // solicitudRepository.save(solicitudDb);

        // 5. Vincular y guardar la Audiencia
        audiencia.setSolicitud(solicitudDb);

        // EMAIL: Notificar a las partes (Mock o Real si está configurado)
        if (emailService != null) {
            try {
                String fecha = audiencia.getFechaAudiencia().toString();
                String hora = audiencia.getHoraAudiencia().toString();
                String lugar = audiencia.getLugar();

                if (solicitudDb.getSolicitante() != null
                        && solicitudDb.getSolicitante().getCorreoElectronico() != null) {
                    emailService.enviarNotificacionProgramacion(solicitudDb.getSolicitante().getCorreoElectronico(),
                            solicitudDb.getNumeroExpediente(), fecha, hora, lugar);
                }
                if (solicitudDb.getInvitado() != null && solicitudDb.getInvitado().getCorreoElectronico() != null) {
                    emailService.enviarNotificacionProgramacion(solicitudDb.getInvitado().getCorreoElectronico(),
                            solicitudDb.getNumeroExpediente(), fecha, hora, lugar);
                }
            } catch (Exception e) {
                System.err.println("Error enviando correos (no bloqueante): " + e.getMessage());
            }
        }

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

            // 🔹 REPROGRAMACIÓN AUTOMÁTICA (Segunda Audiencia)
            if (datos.getFechaAudiencia() != null && datos.getHoraAudiencia() != null) {
                System.out.println("🔄 REPROGRAMANDO AUDIENCIA: Creando nueva fecha...");

                Audiencia nuevaAudiencia = new Audiencia();
                nuevaAudiencia.setSolicitud(solicitud);
                nuevaAudiencia.setFechaAudiencia(datos.getFechaAudiencia());
                nuevaAudiencia.setHoraAudiencia(datos.getHoraAudiencia());
                nuevaAudiencia.setLugar(datos.getLugar() != null ? datos.getLugar() : a.getLugar());
                // nuevaAudiencia.setNroAudiencia(2); // Si tuviéramos campo nroAudiencia

                repository.save(nuevaAudiencia);

                solicitud.setEstado("PROGRAMADO"); // Reactiva el flujo para notificador
            }
            // 🔹 LÓGICA EXISTENTE DE ESTADOS
            else if (datos.getResultadoDetalle() != null && datos.getResultadoDetalle().contains("actaUrl")) {
                String rTipo = datos.getResultadoTipo();
                if (rTipo != null && (rTipo.equalsIgnoreCase("Acuerdo Total") || rTipo.contains("Acuerdo Parcial"))) {
                    solicitud.setEstado("FINALIZADA");
                } else {
                    solicitud.setEstado("PENDIENTE_FIRMA");
                }
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