package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuracion_sistema")
@Data
public class ConfiguracionSistema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 100)
    private String clave;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String valor;

    @Column(nullable = false, length = 50)
    private String categoria; // ESTADO, MATERIA, RECHAZO, HORARIO
}