package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.UsuarioSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Integer> {

    // Busca un usuario por su login (usado en autenticación)
    Optional<UsuarioSistema> findByUsuario(String usuario);

    // Cuenta usuarios por estado (Activo/Inactivo) para el Dashboard
    long countByEstado(String estado);

    // Filtra personal por rol (Ej: DIRECTOR, CONCILIADOR)
    List<UsuarioSistema> findByRoles(String rol);

    // 🔹 NUEVO: Contar usuarios por rol (Para Dashboard)
    long countByRoles(String roles);
}