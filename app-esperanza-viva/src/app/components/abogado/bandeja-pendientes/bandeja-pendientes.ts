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
        this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
            next: (res) => {
                this.pendientes = res.filter(s => s.estado === 'PENDIENTE_FIRMA' || !s.estado);
                this.porFirmar = this.pendientes.length;
                this.observadas = res.filter(s => s.estado === 'OBSERVADA').length;
                this.aprobadas = res.filter(s => s.estado === 'FINALIZADA').length;
                setTimeout(() => this.isLoading = false, 500);
            },
            error: (err) => {
                console.error("Error cargando pendientes", err);
                this.isLoading = false;
            }
        });
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']); // ✅ FIXED: Route confirmed in app.routes.ts
    }
}
