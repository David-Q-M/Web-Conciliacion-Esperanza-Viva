package appesperanzaviva.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todos los controladores (Usuarios, Auditoría, Reportes)
                .allowedOrigins("http://localhost:4200") // Permite el origen de tu Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos necesarios para los Wireframes
                .allowedHeaders("*") // Permite todos los encabezados
                .allowCredentials(true) // Necesario para manejar sesiones en el futuro
                .maxAge(3600); // Cache de la configuración CORS para mejorar el rendimiento
    }
}