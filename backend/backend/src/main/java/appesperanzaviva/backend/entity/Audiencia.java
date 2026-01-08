package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "audiencias")
@Data
public class Audiencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false)
    private Solicitud solicitud;

    private LocalDate fechaAudiencia;
    private LocalTime horaAudiencia;

    private String lugar;
    private Boolean asistenciaSolicitante;
    private Boolean asistenciaInvitado;
    private String resultadoTipo;

    @Column(columnDefinition = "TEXT")
    private String resultadoDetalle;

    @ManyToOne
    @JoinColumn(name = "abogado_verificador_id")
    private UsuarioSistema abogadoVerificador;
}
