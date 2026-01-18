package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Auditoria;
import appesperanzaviva.backend.entity.Solicitud;
import appesperanzaviva.backend.repository.AuditoriaRepository;
import appesperanzaviva.backend.repository.SolicitudRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditoriaService {
    @Autowired
    private AuditoriaRepository repository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    public void registrarAccion(String usuario, String accion, String detalles, String expedienteNumero) {
        Auditoria log = new Auditoria();
        log.setUsuarioNombre(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);

        if (expedienteNumero != null && !expedienteNumero.isEmpty()) {
            Solicitud s = solicitudRepository.findByNumeroExpediente(expedienteNumero).orElse(null);
            if (s != null) {
                log.setSolicitud(s);
            }
        }
        repository.save(log);
    }

    // Sobrecarga renombrada para evitar ambigüedad con null
    public void registrarAccionSolicitud(String usuario, String accion, String detalles, Solicitud solicitud) {
        Auditoria log = new Auditoria();
        log.setUsuarioNombre(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);
        log.setSolicitud(solicitud);
        repository.save(log);
    }

    public List<Auditoria> listarLogs() {
        return repository.findAll();
    }
}