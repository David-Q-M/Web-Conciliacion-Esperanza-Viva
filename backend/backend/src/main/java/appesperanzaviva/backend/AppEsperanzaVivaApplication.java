package appesperanzaviva.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "appesperanzaviva.backend.entity")
@EnableJpaRepositories(basePackages = "appesperanzaviva.backend.repository")
public class AppEsperanzaVivaApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppEsperanzaVivaApplication.class, args);
    }
}