import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';

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
        private router: Router
    ) { }

    ngOnInit(): void {
        this.idSolicitud = this.route.snapshot.paramMap.get('id');
        if (this.idSolicitud) {
            this.cargarDetalle();
        }
    }

    cargarDetalle() {
        this.http.get<any>(`http://localhost:8080/api/solicitudes/${this.idSolicitud}`).subscribe({
            next: (res) => this.expediente = res,
            error: (err) => console.error("Error cargando expediente", err)
        });
    }

    descargarPDF() {
        const doc = new jsPDF();
        doc.text('ACTA DE CONCILIACIÓN', 105, 20, { align: 'center' });
        doc.text(`Expediente: ${this.expediente?.numeroExpediente}`, 20, 40);
        doc.text(`Solicitante: ${this.expediente?.solicitante?.nombres}`, 20, 50);
        doc.save(`Acta_${this.expediente?.numeroExpediente}.pdf`);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.archivoFirmado = file;
            this.nombreArchivo = file.name;
        }
    }

    aprobarLegalidad() {
        this.actualizarEstado('FINALIZADA');
    }

    observar() {
        this.actualizarEstado('OBSERVADA');
    }

    actualizarEstado(nuevoEstado: string) {
        if (!this.idSolicitud) return;

        this.http.put(`http://localhost:8080/api/solicitudes/${this.idSolicitud}/estado`, {
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
        this.router.navigate(['/consulta']); // ✅ FIXED: Route confirmed in app.routes.ts
    }
}
