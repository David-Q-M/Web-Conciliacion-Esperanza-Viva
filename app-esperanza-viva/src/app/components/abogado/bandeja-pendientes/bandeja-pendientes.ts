import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-bandeja-pendientes',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './bandeja-pendientes.html',
    styleUrls: ['./bandeja-pendientes.css']
})
export class BandejaPendientes implements OnInit {
    abogadoNombre: string = 'Dr. Luis Alberto Ramirez';
    pendientes: any[] = [];
    isLoading: boolean = true;

    // Contadores
    porFirmar: number = 0;
    observadas: number = 0;
    aprobadas: number = 0;

    filtroActual: string = 'POR_FIRMAR';
    pendientesOriginales: any[] = []; // Backup of all data

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.abogadoNombre = user.nombreCompleto || this.abogadoNombre;
        }

        this.cargarPendientes();
    }

    cargarPendientes() {
        this.isLoading = true;
        this.http.get<any[]>('https://web-conciliacion-esperanza-viva-production.up.railway.app/api/solicitudes').subscribe({
            next: (res) => {
                // Fetch all relevant lawyer requests
                this.pendientesOriginales = res.filter(s =>
                    ['PENDIENTE_FIRMA', 'OBSERVADA', 'FINALIZADA'].includes(s.estado || 'PENDIENTE_FIRMA')
                );

                this.porFirmar = this.pendientesOriginales.filter(s => s.estado === 'PENDIENTE_FIRMA').length;
                this.observadas = this.pendientesOriginales.filter(s => s.estado === 'OBSERVADA').length;
                this.aprobadas = this.pendientesOriginales.filter(s => s.estado === 'FINALIZADA').length;

                // Apply initial filter
                this.filtrarPorEstado('POR_FIRMAR');
                setTimeout(() => this.isLoading = false, 500);
            },
            error: (err) => {
                console.error("Error cargando pendientes", err);
                this.isLoading = false;
            }
        });
    }

    filtrarPorEstado(tipo: string) {
        this.filtroActual = tipo;
        if (tipo === 'POR_FIRMAR') {
            this.pendientes = this.pendientesOriginales.filter(s => s.estado === 'PENDIENTE_FIRMA');
        } else if (tipo === 'OBSERVADAS') {
            this.pendientes = this.pendientesOriginales.filter(s => s.estado === 'OBSERVADA');
        } else if (tipo === 'APROBADAS') {
            this.pendientes = this.pendientesOriginales.filter(s => s.estado === 'FINALIZADA');
        }
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
