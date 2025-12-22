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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Configuración de sesión sin estado (típico de APIs REST)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 2. Desactivar CSRF y Form Login que causan el error 403 en Angular
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)

            // 3. Aplicar la política CORS definida en WebConfig
            .cors(Customizer.withDefaults())

            // 4. Reglas de acceso a las rutas
            .authorizeHttpRequests(auth -> auth
                // Permitir peticiones de diagnóstico (OPTIONS) del navegador
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Permitir acceso total a las solicitudes de ciudadanos
                .requestMatchers("/api/solicitudes/**").permitAll()
                // El resto requiere autenticación (para el futuro panel admin)
                .requestMatchers("/api/usuarios/**").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}