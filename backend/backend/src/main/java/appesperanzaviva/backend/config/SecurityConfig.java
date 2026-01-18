package appesperanzaviva.backend.config;

import appesperanzaviva.backend.service.impl.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtTokenFilter jwtTokenFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/usuarios-sistema/login").permitAll()

                        // 🔹 Allow Public Registration of Solicitudes (POST)
                        .requestMatchers(HttpMethod.POST, "/api/solicitudes/**").permitAll()

                        // 🔹 Allow Public Status Check (GET for search)
                        .requestMatchers(HttpMethod.GET, "/api/solicitudes/buscar/**").permitAll()

                        // Role-Based Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/solicitudes/**")
                        .hasAnyRole("ABOGADO", "DIRECTOR", "SECRETARIO", "ADMINISTRADOR", "CONCILIADOR", "NOTIFICADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/solicitudes/**")
                        .hasAnyRole("ABOGADO", "DIRECTOR", "SECRETARIO", "ADMINISTRADOR", "CONCILIADOR", "NOTIFICADOR")

                        .requestMatchers("/api/audiencias/**")
                        .hasAnyRole("CONCILIADOR", "SECRETARIO", "DIRECTOR", "NOTIFICADOR")
                        .requestMatchers("/api/actas/**").hasAnyRole("CONCILIADOR", "DIRECTOR", "ABOGADO", "SECRETARIO")
                        .requestMatchers("/api/reportes/**").hasAnyRole("DIRECTOR", "ADMINISTRADOR")
                        .requestMatchers("/api/configuracion/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("/api/auditoria/**").hasRole("ADMINISTRADOR")

                        // User Management
                        .requestMatchers("/api/usuarios-sistema/**").permitAll() // Allow testing/creation temporarily
                                                                                 // or restrict to Admin

                        .anyRequest().authenticated());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://lucid-consideration-production.up.railway.app",
                "https://sistemaventa-david.netlify.app"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}