package appesperanzaviva.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 15)
    private String dni; // Documento de identidad [cite: 27]

    @Column(nullable = false)
    private String nombres; // [cite: 25]

    @Column(nullable = false)
    private String apellidos; // [cite: 26]

    private String domicilio; // [cite: 28]
    private String telefono; // [cite: 30]
    private String correoElectronico; // [cite: 29]
}