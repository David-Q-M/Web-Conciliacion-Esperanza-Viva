package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.UsuarioSistema;
import appesperanzaviva.backend.repository.UsuarioSistemaRepository;
import appesperanzaviva.backend.service.AuditoriaService;
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

    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping
    public List<UsuarioSistema> listar() {
        return repository.findAll();
    }

    @PostMapping("/registrar")
    public UsuarioSistema registrar(@RequestBody UsuarioSistema usuario) {
        UsuarioSistema nuevo = repository.save(usuario);
        // Registramos el evento en la Auditoría (Wireframe 35)
        auditoriaService.registrarAccion(
            "Administrador", 
            "REGISTRO", 
            "Se registró nuevo personal: " + nuevo.getNombreCompleto() + " (" + nuevo.getRol() + ")", 
            null
        );
        return nuevo;
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioSistema> actualizar(@PathVariable Integer id, @RequestBody UsuarioSistema detalles) {
        return repository.findById(id)
                .map(u -> {
                    u.setNombreCompleto(detalles.getNombreCompleto());
                    u.setUsuario(detalles.getUsuario());
                    // Solo actualizamos contraseña si se envía una nueva
                    if(detalles.getContrasena() != null && !detalles.getContrasena().isEmpty()){
                        u.setContrasena(detalles.getContrasena());
                    }
                    u.setRol(detalles.getRol());
                    // Campos profesionales para Conciliadores y Abogados
                    u.setNroRegistro(detalles.getNroRegistro());
                    u.setNroEspecializacion(detalles.getNroEspecializacion());
                    u.setNroColegiatura(detalles.getNroColegiatura());
                    
                    UsuarioSistema actualizado = repository.save(u);
                    auditoriaService.registrarAccion("Administrador", "ACTUALIZACIÓN", "Se actualizaron datos de: " + u.getUsuario(), null);
                    return ResponseEntity.ok(actualizado);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String user = credentials.get("usuario");
        String pass = credentials.get("contrasena");

        return repository.findByUsuario(user)
                .filter(u -> u.getContrasena().equals(pass))
                .map(u -> {
                    // El log de auditoría ahora muestra quién entró realmente
                    auditoriaService.registrarAccion(u.getUsuario(), "LOGIN", "Ingreso exitoso al sistema", null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.status(401).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        return repository.findById(id)
                .map(u -> {
                    repository.delete(u);
                    auditoriaService.registrarAccion("Administrador", "ELIMINACIÓN", "Se eliminó al usuario: " + u.getUsuario(), null);
                    return ResponseEntity.noContent().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }

    // 🔹 NUEVO: Endpoint para listar por rol (Necesario para el Director - Wireframe 19)
    @GetMapping("/rol/{rol}")
    public List<UsuarioSistema> listarPorRol(@PathVariable String rol) {
        return repository.findByRol(rol);
    }
}