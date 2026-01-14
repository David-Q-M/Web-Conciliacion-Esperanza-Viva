package appesperanzaviva.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import appesperanzaviva.backend.entity.ConfiguracionSistema;
import appesperanzaviva.backend.repository.ConfiguracionRepository;

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
    public ConfiguracionSistema guardar(@RequestBody @NonNull ConfiguracionSistema config) {
        return repository.save(config);
    }

    // 🔹 NUEVO: Método para actualizar configuraciones existentes (Edición de Estados)
    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracionSistema> actualizar(@PathVariable @NonNull Integer id, @RequestBody @NonNull ConfiguracionSistema configDetails) {
        return repository.findById(id).map(config -> {
            config.setClave(configDetails.getClave());
            config.setValor(configDetails.getValor());
            config.setCategoria(configDetails.getCategoria());
            ConfiguracionSistema actualizada = repository.save(config);
            return ResponseEntity.ok(actualizada);
        }).orElse(ResponseEntity.notFound().build());
    }
}