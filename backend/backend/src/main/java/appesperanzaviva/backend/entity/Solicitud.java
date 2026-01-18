package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número de seguimiento tipo EXP-2025-000003
    @Column(name = "numero_expediente", unique = true, length = 255)
    private String numeroExpediente;

    // Datos del Solicitante (Relación con tabla personas)
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "solicitante_id")
    private Persona solicitante;

    // 🔹 Campo añadido para corregir el error Unrecognized field "subMateria"
    @Column(name = "sub_materia")
    private String subMateria;

    // Datos del Invitado (Relación con tabla personas)
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "invitado_id")
    private Persona invitado;

    // Apoderado opcional para el Formato A
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "apoderado_id")
    private Persona apoderado;

    // Descripción del Conflicto
    @Column(name = "materia_conciliable")
    private String materiaConciliable;

    @Column(columnDefinition = "TEXT")
    private String hechos;

    @Column(columnDefinition = "TEXT")
    private String pretension;

    private String estado; // PENDIENTE, APROBADA, etc.

    @Column(name = "fecha_presentacion")
    private LocalDateTime fechaPresentacion;

    // URLs de los archivos guardados en el servidor
    @Column(name = "dni_archivo_url")
    private String dniArchivoUrl;

    @Column(name = "pruebas_archivo_url")
    private String pruebasArchivoUrl;

    @Column(name = "firma_archivo_url")
    private String firmaArchivoUrl;

    // Campo adicional para observaciones del director
    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "otras_personas_alimentario", columnDefinition = "TEXT")
    private String otrasPersonasAlimentario;

    // 🔹 NUEVO: Conciliador asignado (Relación con usuarios_sistema)
    @ManyToOne
    @JoinColumn(name = "conciliador_id")
    private UsuarioSistema conciliador;

    // 🔹 NUEVO: Notificador asignado para diligenciar la invitación
    @ManyToOne
    @JoinColumn(name = "notificador_id")
    private UsuarioSistema notificador;

    // 🔹 NUEVO: Secretario asignado (Relación con usuarios_sistema)
    @ManyToOne
    @JoinColumn(name = "secretario_id")
    private UsuarioSistema secretario;

    @Column(name = "modalidad")
    private String modalidad;

    // 🔹 NUEVO: Relación bidireccional para que el Director vea la audiencia
    // programada
    // 🔹 FIX: Cambio a OneToMany para soportar múltiples audiencias
    // (reprogramaciones o datos sucios)
    @OneToMany(mappedBy = "solicitud", fetch = FetchType.LAZY)
    private java.util.List<Audiencia> audiencias;

    public java.util.List<Audiencia> getAudiencias() {
        return audiencias;
    }

    public void setAudiencias(java.util.List<Audiencia> audiencias) {
        this.audiencias = audiencias;
    }

    public String getModalidad() {
        return modalidad;
    }

    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }

    @PrePersist
    protected void onCreate() {
        if (this.fechaPresentacion == null) {
            this.fechaPresentacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroExpediente() {
        return numeroExpediente;
    }

    public void setNumeroExpediente(String numeroExpediente) {
        this.numeroExpediente = numeroExpediente;
    }

    public Persona getSolicitante() {
        return solicitante;
    }

    public void setSolicitante(Persona solicitante) {
        this.solicitante = solicitante;
    }

    public String getSubMateria() {
        return subMateria;
    }

    public void setSubMateria(String subMateria) {
        this.subMateria = subMateria;
    }

    public Persona getInvitado() {
        return invitado;
    }

    public void setInvitado(Persona invitado) {
        this.invitado = invitado;
    }

    public Persona getApoderado() {
        return apoderado;
    }

    public void setApoderado(Persona apoderado) {
        this.apoderado = apoderado;
    }

    public String getMateriaConciliable() {
        return materiaConciliable;
    }

    public void setMateriaConciliable(String materiaConciliable) {
        this.materiaConciliable = materiaConciliable;
    }

    public String getHechos() {
        return hechos;
    }

    public void setHechos(String hechos) {
        this.hechos = hechos;
    }

    public String getPretension() {
        return pretension;
    }

    public void setPretension(String pretension) {
        this.pretension = pretension;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaPresentacion() {
        return fechaPresentacion;
    }

    public void setFechaPresentacion(LocalDateTime fechaPresentacion) {
        this.fechaPresentacion = fechaPresentacion;
    }

    public String getDniArchivoUrl() {
        return dniArchivoUrl;
    }

    public void setDniArchivoUrl(String dniArchivoUrl) {
        this.dniArchivoUrl = dniArchivoUrl;
    }

    public String getPruebasArchivoUrl() {
        return pruebasArchivoUrl;
    }

    public void setPruebasArchivoUrl(String pruebasArchivoUrl) {
        this.pruebasArchivoUrl = pruebasArchivoUrl;
    }

    public String getFirmaArchivoUrl() {
        return firmaArchivoUrl;
    }

    public void setFirmaArchivoUrl(String firmaArchivoUrl) {
        this.firmaArchivoUrl = firmaArchivoUrl;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public String getOtrasPersonasAlimentario() {
        return otrasPersonasAlimentario;
    }

    public void setOtrasPersonasAlimentario(String otrasPersonasAlimentario) {
        this.otrasPersonasAlimentario = otrasPersonasAlimentario;
    }

    public UsuarioSistema getConciliador() {
        return conciliador;
    }

    public void setConciliador(UsuarioSistema conciliador) {
        this.conciliador = conciliador;
    }

    public UsuarioSistema getNotificador() {
        return notificador;
    }

    public void setNotificador(UsuarioSistema notificador) {
        this.notificador = notificador;
    }

    public UsuarioSistema getSecretario() {
        return secretario;
    }

    public void setSecretario(UsuarioSistema secretario) {
        this.secretario = secretario;
    }

}