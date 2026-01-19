package appesperanzaviva.backend.controller;

import appesperanzaviva.backend.entity.ConfiguracionSistema;
import appesperanzaviva.backend.repository.ConfiguracionRepository;
import appesperanzaviva.backend.repository.SolicitudRepository;
import appesperanzaviva.backend.repository.UsuarioSistemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "https://lucid-consideration-production.up.railway.app", allowedHeaders = "*")
public class ReporteController {

    @Autowired
    private SolicitudRepository solicitudRepo;

    @Autowired
    private UsuarioSistemaRepository usuarioRepo;

    @Autowired
    private ConfiguracionRepository configRepo;

    @GetMapping("/estadisticas")
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Obtener estados configurados
        List<ConfiguracionSistema> estadosConfig = configRepo.findByCategoria("ESTADO");

        // 2. Indicadores Clave
        long total = solicitudRepo.count();
        long activos = usuarioRepo.countByEstado("ACTIVO");

        // Buscamos el valor para el estado final (ej. "FINALIZADO")
        String estadoFinal = estadosConfig.stream()
                .filter(c -> c.getClave().contains("estado_3") || c.getValor().equalsIgnoreCase("FINALIZADO"))
                .map(ConfiguracionSistema::getValor)
                .findFirst().orElse("FINALIZADO");

        long finalizados = solicitudRepo.countByEstado(estadoFinal);

        stats.put("totalSolicitudes", total);
        stats.put("personalActivo", activos);

        // 🔹 Cálculo de Tasa de Finalización para las barras de progreso
        double tasa = (total > 0) ? Math.round(((double) finalizados / total) * 100.0) : 0.0;
        stats.put("tasaFinalizacion", tasa);

        // 3. Conteo dinámico para Gráfico de Barras y Cajas de Estadísticas
        for (ConfiguracionSistema config : estadosConfig) {
            String nombreEstado = config.getValor();
            long conteo = solicitudRepo.countByEstado(nombreEstado);
            // Normalizamos: "PENDIENTE" -> "pendienteCount"
            stats.put(nombreEstado.toLowerCase() + "Count", conteo);
        }

        stats.put("finalizadosContador", finalizados);

        return stats;
    }
}