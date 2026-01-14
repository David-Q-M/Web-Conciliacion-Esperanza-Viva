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
                this.historial = res.filter(s =>
                    ['FINALIZADA', 'OBSERVADA', 'FIRMADA', 'APROBADA'].includes(s.estado)
                );
                setTimeout(() => this.isLoading = false, 500);
            },
            error: (err) => {
                console.error("Error cargando historial", err);
                this.isLoading = false;
            }
        });
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']); // ✅ FIXED: Route confirmed in app.routes.ts
    }
}
