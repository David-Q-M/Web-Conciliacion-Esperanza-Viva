import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-historial-notificador',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './historial-notificador.html',
    styleUrls: ['../bandeja-notificador/bandeja-notificador.css']
})
export class HistorialNotificador implements OnInit {
    notificadorNombre: string = 'Juan Perez';
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
            this.notificadorNombre = user.nombreCompleto || this.notificadorNombre;
        }
        this.buscarHistorial();
    }

    buscarHistorial() {
        this.isLoading = true;
        this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
            next: (res) => {
                this.historial = res.filter(s =>
                    ['NOTIFICADO', 'ENTREGADO', 'DEVUELTO'].includes(s.estado) || s.estado === 'NOTIFICADO'
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
        this.router.navigate(['/consulta']); // ✅ Redirect to /consulta confirmed
    }
}
