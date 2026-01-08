package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Auditoria;
import appesperanzaviva.backend.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditoriaService {
    @Autowired
    private AuditoriaRepository repository;

    public void registrarAccion(String usuario, String accion, String detalles, String expedienteId) {
        Auditoria log = new Auditoria();
        log.setUsuarioNombre(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);
        log.setExpedienteId(expedienteId);
        repository.save(log);
    }

    public List<Auditoria> listarLogs() {
        return repository.findAll();
    }
}