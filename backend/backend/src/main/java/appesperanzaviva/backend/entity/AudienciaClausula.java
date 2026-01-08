package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "audiencia_clausulas")
@Data
public class AudienciaClausula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "audiencia_id")
    private Audiencia audiencia;

    private Integer orden; // 1 para PRIMERO, 2 para SEGUNDO...
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}