package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios_sistema")
@Data
public class UsuarioSistema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, unique = true)
    private String usuario;

    @Column(nullable = false)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol; // ADMINISTRADOR, DIRECTOR, CONCILIADOR, ABOGADO, NOTIFICADOR

    private String estado = "ACTIVO";

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDate.now();
    }
}

enum RolUsuario {
    ADMINISTRADOR, DIRECTOR, CONCILIADOR, ABOGADO, NOTIFICADOR
}