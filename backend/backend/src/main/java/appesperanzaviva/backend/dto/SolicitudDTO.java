package appesperanzaviva.backend.dto;

import java.time.LocalDateTime;

public class SolicitudDTO {
    private Long id;
    private String numeroExpediente;
    private String estado;
    private LocalDateTime fechaPresentacion;
    private String materiaConciliable;
    private String subMateria;
    private String resultadoTipo;

    // Datos planos de relaciones
    private String solicitanteNombre;
    private String invitadoNombre;
    private String conciliadorNombre;
    private Long conciliadorId;

    // Datos de audiencia básica (para vistas de lista)
    private java.time.LocalDate fechaAudiencia;

    public SolicitudDTO() {
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

    public String getMateriaConciliable() {
        return materiaConciliable;
    }

    public void setMateriaConciliable(String materiaConciliable) {
        this.materiaConciliable = materiaConciliable;
    }

    public String getSubMateria() {
        return subMateria;
    }

    public void setSubMateria(String subMateria) {
        this.subMateria = subMateria;
    }

    public String getResultadoTipo() {
        return resultadoTipo;
    }

    public void setResultadoTipo(String resultadoTipo) {
        this.resultadoTipo = resultadoTipo;
    }

    public String getSolicitanteNombre() {
        return solicitanteNombre;
    }

    public void setSolicitanteNombre(String solicitanteNombre) {
        this.solicitanteNombre = solicitanteNombre;
    }

    public String getInvitadoNombre() {
        return invitadoNombre;
    }

    public void setInvitadoNombre(String invitadoNombre) {
        this.invitadoNombre = invitadoNombre;
    }

    public String getConciliadorNombre() {
        return conciliadorNombre;
    }

    public void setConciliadorNombre(String conciliadorNombre) {
        this.conciliadorNombre = conciliadorNombre;
    }

    public Long getConciliadorId() {
        return conciliadorId;
    }

    public void setConciliadorId(Long conciliadorId) {
        this.conciliadorId = conciliadorId;
    }

    public java.time.LocalDate getFechaAudiencia() {
        return fechaAudiencia;
    }

    public void setFechaAudiencia(java.time.LocalDate fechaAudiencia) {
        this.fechaAudiencia = fechaAudiencia;
    }
}
