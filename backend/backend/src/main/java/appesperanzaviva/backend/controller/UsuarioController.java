package appesperanzaviva.backend.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import appesperanzaviva.backend.entity.UsuarioSistema;
import appesperanzaviva.backend.repository.UsuarioSistemaRepository;
import appesperanzaviva.backend.service.AuditoriaService;

@RestController
@RequestMapping("/api/usuarios-sistema")
@CrossOrigin(origins = "https://lucid-consideration-production.up.railway.app")
public class UsuarioController {

    @Autowired
    private UsuarioSistemaRepository repository;

    @Autowired
    private appesperanzaviva.backend.config.JwtUtils jwtUtils;

    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping
    public List<UsuarioSistema> listar() {
        return repository.findAll();
    }

    @PostMapping("/registrar")
    public UsuarioSistema registrar(@RequestBody @NonNull UsuarioSistema usuario) {
        UsuarioSistema nuevo = repository.save(usuario);
        auditoriaService.registrarAccion(
                "Administrador",
                "REGISTRO",
                "Se registró nuevo personal: " + nuevo.getNombreCompleto() + " (" + nuevo.getRoles() + ")",
                null);
        return nuevo;
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioSistema> actualizar(@PathVariable @NonNull Integer id,
            @RequestBody UsuarioSistema detalles) {
        return repository.findById(id)
                .map((@NonNull UsuarioSistema u) -> {
                    // Sincronización de campos personales (Wireframe 13)
                    u.setNombreCompleto(detalles.getNombreCompleto());
                    u.setDni(detalles.getDni());
                    u.setTelefono(detalles.getTelefono());
                    u.setDireccion(detalles.getDireccion());
                    u.setCorreoElectronico(detalles.getCorreoElectronico());

                    u.setUsuario(detalles.getUsuario());
                    if (detalles.getContrasena() != null && !detalles.getContrasena().isEmpty()) {
                        u.setContrasena(detalles.getContrasena());
                    }

                    u.setRoles(detalles.getRoles());
                    u.setEstado(detalles.getEstado());
                    u.setNroRegistro(detalles.getNroRegistro());
                    u.setNroColegiatura(detalles.getNroColegiatura());

                    UsuarioSistema actualizado = repository.save(u);
                    auditoriaService.registrarAccion("Administrador", "ACTUALIZACIÓN",
                            "Se actualizaron datos de: " + u.getUsuario(), null);
                    return ResponseEntity.ok(actualizado);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String user = credentials.get("usuario");
        String pass = credentials.get("contrasena");

        return repository.findByUsuario(user)
                .filter(u -> u.getContrasena().equals(pass))
                .map((@NonNull UsuarioSistema u) -> {
                    // Generar Token JWT
                    String rolPrincipal = u.getRoles().isEmpty() ? "USER" : u.getRoles().iterator().next();
                    // Nota: Si tiene multiples roles, aqui tomamos uno.
                    // Idealmente el token debería soportar lista, pero JwtUtils.generateToken pide
                    // String.
                    // Para simplificar, pasamos el primer rol. O concatenamos.

                    String token = jwtUtils.generateToken(u.getUsuario(), rolPrincipal);
                    u.setToken(token); // Set transient token

                    auditoriaService.registrarAccion(u.getUsuario(), "LOGIN", "Ingreso exitoso", null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.status(401).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @NonNull Integer id) {
        return repository.findById(id)
                .map((@NonNull UsuarioSistema u) -> {
                    String nombre = u.getUsuario();
                    repository.delete(u);
                    auditoriaService.registrarAccion("Administrador", "ELIMINACIÓN", "Se eliminó a: " + nombre, null);
                    return ResponseEntity.noContent().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rol/{rol}")
    public List<UsuarioSistema> listarPorRol(@PathVariable String rol) {
        return repository.findByRoles(rol.toUpperCase());
    }

    // 🔹 NUEVO: Endpoint para contar usuarios por rol (Dashboard)
    @GetMapping("/count/rol/{rol}")
    public ResponseEntity<Long> contarPorRol(@PathVariable String rol) {
        return ResponseEntity.ok(repository.countByRoles(rol.toUpperCase()));
    }
}