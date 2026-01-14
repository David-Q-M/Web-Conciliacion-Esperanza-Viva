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
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                // Sesión sin estado (Stateless) para que Angular mande los datos y no dependa del servidor
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 🛡️ ACCESO TOTAL A LAS APIS DE TRABAJO
                        .requestMatchers(
                            "/api/solicitudes/**", 
                            "/api/usuarios-sistema/**", 
                            "/api/audiencias/**",
                            "/api/reportes/**",
                            "/api/configuracion/**", 
                            "/api/auditoria/**"
                        ).permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }
}