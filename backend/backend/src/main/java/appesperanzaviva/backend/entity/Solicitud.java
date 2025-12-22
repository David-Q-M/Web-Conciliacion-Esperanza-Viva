package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
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

    // Datos del Invitado (Relación con tabla personas)
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "invitado_id")
    private Persona invitado;
    
    // 🔹 NUEVO: Apoderado opcional para el Formato A
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "apoderado_id")
    private Persona apoderado;

    // Wireframe-3: Descripción del Conflicto
    @Column(name = "materia_conciliable")
    private String materiaConciliable; 
    
    @Column(columnDefinition = "TEXT")
    private String hechos; 
    
    @Column(columnDefinition = "TEXT")
    private String pretension; 

    private String estado; // PENDIENTE, APROBADA, etc.
    
    @Column(name = "fecha_presentacion")
    private LocalDateTime fechaPresentacion;

    // WIREFRAME-4: URLs de los archivos guardados en el servidor
    @Column(name = "dni_archivo_url")
    private String dniArchivoUrl;

    @Column(name = "pruebas_archivo_url")
    private String pruebasArchivoUrl;

    @Column(name = "firma_archivo_url")
    private String firmaArchivoUrl;

    // Campo adicional para observaciones del director (Wireframe-5)
    @Column(columnDefinition = "TEXT")
    private String observacion;

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