package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // 🔹 Importación necesaria
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) // 🔹 Evita errores si Angular envía campos adicionales
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

    @PrePersist
    protected void onCreate() {
        if (this.fechaPresentacion == null) {
            this.fechaPresentacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }
}