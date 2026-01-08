package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios_sistema") // Debe coincidir con MariaDB
@Data
public class UsuarioSistema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Cambiado a Integer para consistencia con el Controller

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false, length = 20)
    private String rol; // Cambiado a String para evitar errores de mapeo con el Enum en el JSON

    @Column(length = 20)
    private String estado = "ACTIVO";

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    // Campos para Conciliadores y Abogados (Wireframes 23 y 24)
    @Column(name = "nro_registro", length = 50)
    private String nroRegistro;

    @Column(name = "nro_especializacion", length = 50)
    private String nroEspecializacion;

    @Column(name = "nro_colegiatura", length = 50)
    private String nroColegiatura;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDate.now();
        if (this.estado == null) this.estado = "ACTIVO";
    }
}