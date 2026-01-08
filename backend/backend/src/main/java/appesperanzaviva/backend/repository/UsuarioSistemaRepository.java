package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.UsuarioSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Integer> {
    
    // Para el proceso de Login
    Optional<UsuarioSistema> findByUsuario(String usuario);
    
    // Para estadísticas de Reportes
    long countByEstado(String estado);
    
    // 🔹 NUEVO: Para listar personal por rol (Ej: Conciliadores para el Director)
    List<UsuarioSistema> findByRol(String rol);
}