package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.UsuarioSistema;
import appesperanzaviva.backend.repository.UsuarioSistemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private UsuarioSistemaRepository repository;

    // Listar todos los empleados (Wireframe-12)
    @GetMapping
    public List<UsuarioSistema> listar() {
        return repository.findAll();
    }

    // Registrar nuevo empleado (Wireframe-13)
    @PostMapping("/registrar")
    public UsuarioSistema registrar(@RequestBody UsuarioSistema usuario) {
        return repository.save(usuario);
    }

    // Actualizar empleado (Wireframe-15)
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioSistema> actualizar(@PathVariable Long id, @RequestBody UsuarioSistema detalles) {
        return repository.findById(id)
                .map(u -> {
                    u.setNombreCompleto(detalles.getNombreCompleto());
                    u.setUsuario(detalles.getUsuario());
                    u.setContrasena(detalles.getContrasena());
                    u.setRol(detalles.getRol());
                    return ResponseEntity.ok(repository.save(u));
                }).orElse(ResponseEntity.notFound().build());
    }

    // Login Simple para empleados (Wireframe-7)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String user = credentials.get("usuario");
        String pass = credentials.get("contrasena");

        return repository.findByUsuario(user)
                .filter(u -> u.getContrasena().equals(pass)) // Nota: En prod usar BCrypt
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.status(401).build());
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}