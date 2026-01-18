import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-historial-abogado',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './historial-abogado.html',
    styleUrls: ['../bandeja-pendientes/bandeja-pendientes.css']
})
export class HistorialAbogado implements OnInit {
    abogadoNombre: string = 'Dr. Luis Alberto Ramirez';
    historial: any[] = [];
    isLoading: boolean = true;

    // Filters
    fechaInicio: string = '';
    fechaFin: string = '';
    estado: string = '';

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.abogadoNombre = user.nombreCompleto || this.abogadoNombre;
        }
        this.buscarHistorial();
    }

    buscarHistorial() {
        this.isLoading = true;
        this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
            next: (res) => {
                this.historial = res.filter(s => {
                    // 1. Base Filter: Only relevant states
                    const isRelevant = ['FINALIZADA', 'OBSERVADA', 'FIRMADA', 'APROBADA'].includes(s.estado);
                    if (!isRelevant) return false;

                    // 2. State Filter
                    if (this.estado && s.estado !== this.estado) return false;

                    // 3. Date Filter (using fechaPresentacion or fechaAsignacion)
                    const dateRaw = s.fechaPresentacion || s.fechaAsignacion;
                    const itemDate = dateRaw ? dateRaw.split('T')[0] : '';

                    if (this.fechaInicio && itemDate < this.fechaInicio) return false;
                    if (this.fechaFin && itemDate > this.fechaFin) return false;

                    return true;
                });
                setTimeout(() => this.isLoading = false, 500);
            },
            error: (err) => {
                console.error("Error cargando historial", err);
                this.isLoading = false;
            }
        });
    }

    descargarPDF(item: any) {
        if (item.firmaArchivoUrl) {
            window.open(item.firmaArchivoUrl, '_blank');
        } else if (item.dniArchivoUrl) {
            // Fallback to other docs if signed act not available
            window.open(item.dniArchivoUrl, '_blank');
        } else {
            alert('No hay documento adjunto disponible para este expediente.');
        }
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
