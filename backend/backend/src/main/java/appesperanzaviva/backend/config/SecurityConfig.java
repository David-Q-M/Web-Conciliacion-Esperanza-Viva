package appesperanzaviva.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                // Permitimos CORS para que Angular no sea bloqueado al cambiar de ruta
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.ALWAYS) // Cambiado a
                                                                                                          // ALWAYS para
                                                                                                          // mantener
                                                                                                          // sesión
                                                                                                          // local
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Permitimos acceso a las APIs principales para evitar redirecciones al login
                        .requestMatchers("/api/solicitudes/**", "/api/usuarios/**", "/api/audiencias/**",
                                "/api/reportes/**",
                                "/api/configuracion/**", "/api/auditoria/**")
                        .permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }
}