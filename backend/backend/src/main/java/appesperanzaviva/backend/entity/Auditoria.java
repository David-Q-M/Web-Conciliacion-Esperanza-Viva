package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Data
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora = LocalDateTime.now();
    
    @Column(name = "usuario_nombre")
    private String usuarioNombre;
    
    private String accion;
    private String detalles;
    
    @Column(name = "expediente_id")
    private String expedienteId;
}