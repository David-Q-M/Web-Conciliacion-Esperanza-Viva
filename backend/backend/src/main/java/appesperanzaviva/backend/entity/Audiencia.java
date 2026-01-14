package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "audiencias")
public class Audiencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🛡️ CRUCIAL: Cargamos la solicitud para traer nombres de solicitante/invitado
    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false)
    private Solicitud solicitud;

    private LocalDate fechaAudiencia;
    private LocalTime horaAudiencia;
    private String lugar;

    // 🛠️ CORRECCIÓN: Cambiado de Boolean a String para recibir "Asistio" / "No asistio"
    private String asistenciaSolicitante;
    private String asistenciaInvitado;
    
    private String resultadoTipo;

    @Column(columnDefinition = "TEXT")
    private String resultadoDetalle;

    @ManyToOne
    @JoinColumn(name = "abogado_verificador_id")
    private UsuarioSistema abogadoVerificador;

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }

    public LocalDate getFechaAudiencia() { return fechaAudiencia; }
    public void setFechaAudiencia(LocalDate fechaAudiencia) { this.fechaAudiencia = fechaAudiencia; }

    public LocalTime getHoraAudiencia() { return horaAudiencia; }
    public void setHoraAudiencia(LocalTime horaAudiencia) { this.horaAudiencia = horaAudiencia; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getAsistenciaSolicitante() { return asistenciaSolicitante; }
    public void setAsistenciaSolicitante(String asistenciaSolicitante) { this.asistenciaSolicitante = asistenciaSolicitante; }

    public String getAsistenciaInvitado() { return asistenciaInvitado; }
    public void setAsistenciaInvitado(String asistenciaInvitado) { this.asistenciaInvitado = asistenciaInvitado; }

    public String getResultadoTipo() { return resultadoTipo; }
    public void setResultadoTipo(String resultadoTipo) { this.resultadoTipo = resultadoTipo; }

    public String getResultadoDetalle() { return resultadoDetalle; }
    public void setResultadoDetalle(String resultadoDetalle) { this.resultadoDetalle = resultadoDetalle; }

    public UsuarioSistema getAbogadoVerificador() { return abogadoVerificador; }
    public void setAbogadoVerificador(UsuarioSistema abogadoVerificador) { this.abogadoVerificador = abogadoVerificador; }
}