package appesperanzaviva.backend.repository;

import appesperanzaviva.backend.entity.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConfiguracionRepository extends JpaRepository<ConfiguracionSistema, Integer> {
    // 🔹 Crucial para separar estados, materias y otros parámetros
    List<ConfiguracionSistema> findByCategoria(String categoria);
}