import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// 🔹 Import ActaService correctly
import { ActaService } from '../../../services/acta.service';

@Component({
    selector: 'app-revision-acta',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './revision-acta.html',
    styleUrls: ['./revision-acta.css']
})
export class RevisionActa implements OnInit {
    idSolicitud: string | null = null;
    expediente: any = null;
    archivoFirmado: File | null = null;
    nombreArchivo: string = 'Sin archivo seleccionado';

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private actaService: ActaService
    ) { }

    ngOnInit(): void {
        this.idSolicitud = this.route.snapshot.paramMap.get('id');
        if (this.idSolicitud) {
            this.cargarDetalle();
        }
    }

    cargarDetalle() {
        this.http.get<any>(`${environment.apiUrl}/solicitudes/${this.idSolicitud}`).subscribe({
            next: (res) => this.expediente = res,
            error: (err) => console.error("Error cargando expediente", err)
        });
    }

    descargarPDF() {
        if (!this.expediente || !this.expediente.audiencias || this.expediente.audiencias.length === 0) {
            alert("No hay audiencia registrada.");
            return;
        }

        // 🔹 FIX: Obtener la última audiencia
        const ultimaAudiencia = this.expediente.audiencias[this.expediente.audiencias.length - 1];

        try {
            // 🔹 FIX: Parse JSON to get URL
            let detalle = {};
            if (ultimaAudiencia.resultadoDetalle) {
                detalle = JSON.parse(ultimaAudiencia.resultadoDetalle);
            }

            // @ts-ignore
            if (detalle.actaUrl) {
                // @ts-ignore
                window.open(detalle.actaUrl, '_blank');
            } else {
                alert("El acta no tiene URL adjunta.");
            }
        } catch (e) {
            console.error("Error parsing resultadoDetalle", e);
            alert("Error al leer el archivo del acta.");
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.archivoFirmado = file;
            this.nombreArchivo = file.name;
        }
    }

    aprobarLegalidad() {
        if (!this.expediente || !this.expediente.audiencias || this.expediente.audiencias.length === 0) {
            alert("No se puede aprobar sin audiencia registrada.");
            return;
        }

        const ultimaAudiencia = this.expediente.audiencias[this.expediente.audiencias.length - 1];

        if (this.archivoFirmado) {
            // 1. Upload Signed File
            const numExp = this.expediente.numeroExpediente || 'SN';
            this.actaService.subirActa(
                ultimaAudiencia.id,
                'ACTA_FIRMADA',
                `ACTA-FIRMADA-${numExp}`,
                this.archivoFirmado
            ).subscribe({
                next: (res) => {
                    console.log("Acta firmada subida:", res);
                    // 2. Update Status
                    this.actualizarEstado('FINALIZADA');
                },
                error: (err) => alert("Error al subir el archivo firmado: " + err.message)
            });
        } else {
            // Fallback if no file selected (Just approve status)
            this.actualizarEstado('FINALIZADA');
        }
    }

    observar() {
        this.actualizarEstado('OBSERVADA');
    }

    actualizarEstado(nuevoEstado: string) {
        if (!this.idSolicitud) return;

        this.http.put(`${environment.apiUrl}/solicitudes/${this.idSolicitud}/estado`, {
            estado: nuevoEstado,
            observacion: nuevoEstado === 'OBSERVADA' ? 'Observación realizada por abogado' : 'Aprobado legalmente'
        }).subscribe({
            next: () => {
                alert("Expediente actualizado correctamente");
                this.router.navigate(['/abogado/pendientes']);
            },
            error: (err) => alert("Error al actualizar estado")
        });
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
