package appesperanzaviva.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "audiencia_clausulas")
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Audiencia getAudiencia() {
        return audiencia;
    }

    public void setAudiencia(Audiencia audiencia) {
        this.audiencia = audiencia;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}