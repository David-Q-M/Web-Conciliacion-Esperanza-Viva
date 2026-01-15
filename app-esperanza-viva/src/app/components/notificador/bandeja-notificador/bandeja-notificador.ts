import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-bandeja-notificador',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './bandeja-notificador.html',
    styleUrls: ['./bandeja-notificador.css']
})
export class BandejaNotificador implements OnInit {
    notificadorNombre: string = 'Juan Perez';
    pendientes: any[] = [];
    isLoading: boolean = true;

    // Contadores
    countPendientes: number = 0;
    countEntregadas: number = 0;
    countUrgente: number = 0;

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.notificadorNombre = user.nombreCompleto || this.notificadorNombre;
        }
        this.cargarPendientes();
    }

    cargarPendientes() {
        this.isLoading = true;
        this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
            next: (res) => {
                // Simulacion de filtro: pendientes de notificación
                this.pendientes = res.filter(s =>
                    s.estado === 'APROBADA' || s.estado === 'PENDIENTE_NOTIFICACION' || s.estado === 'AUDIENCIA_PROGRAMADA'
                );

                this.countPendientes = this.pendientes.length;
                this.countEntregadas = res.filter(s => s.estado === 'NOTIFICADO' || s.estado === 'ENTREGADO').length;
                this.countUrgente = Math.floor(Math.random() * 2); // Mock

                setTimeout(() => this.isLoading = false, 500);
            },
            error: (err) => {
                console.error("Error cargando notificaciones", err);
                this.isLoading = false;
            }
        });
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']); // ✅ Redirect to /consulta confirmed
    }
}
