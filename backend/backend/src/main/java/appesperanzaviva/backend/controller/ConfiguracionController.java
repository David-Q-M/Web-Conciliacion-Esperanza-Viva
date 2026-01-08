package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.ConfiguracionSistema;
import appesperanzaviva.backend.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ConfiguracionController {

    @Autowired
    private ConfiguracionRepository repository;

    @GetMapping
    public List<ConfiguracionSistema> listarTodo() {
        return repository.findAll();
    }

    @GetMapping("/categoria/{cat}")
    public List<ConfiguracionSistema> listarPorCategoria(@PathVariable String cat) {
        // Útil para cargar solo los "ESTADOS" o "MATERIAS" en los selectores
        return repository.findByCategoria(cat);
    }

    @PostMapping
    public ConfiguracionSistema guardar(@RequestBody ConfiguracionSistema config) {
        return repository.save(config);
    }

    // 🔹 NUEVO: Método para actualizar configuraciones existentes (Edición de Estados)
    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracionSistema> actualizar(@PathVariable Integer id, @RequestBody ConfiguracionSistema configDetails) {
        return repository.findById(id).map(config -> {
            config.setClave(configDetails.getClave());
            config.setValor(configDetails.getValor());
            config.setCategoria(configDetails.getCategoria());
            ConfiguracionSistema actualizada = repository.save(config);
            return ResponseEntity.ok(actualizada);
        }).orElse(ResponseEntity.notFound().build());
    }
}