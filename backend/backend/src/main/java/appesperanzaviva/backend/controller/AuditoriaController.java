package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.Auditoria;
import appesperanzaviva.backend.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "https://lucid-consideration-production.up.railway.app", allowedHeaders = "*")
public class AuditoriaController {

    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping
    public List<Auditoria> listarLogs() {
        return auditoriaService.listarLogs();
    }
}