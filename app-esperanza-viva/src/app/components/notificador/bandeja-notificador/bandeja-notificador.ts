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
        let userId: number | null = null;
        if (userJson) {
            const user = JSON.parse(userJson);
            this.notificadorNombre = user.nombreCompleto || this.notificadorNombre;
            userId = user.id;
        }

        if (userId) {
            this.cargarPendientes(userId);
        } else {
            console.error("No user ID found for Notifier");
            this.isLoading = false;
        }
    }

    cargarPendientes(userId: number) {
        this.isLoading = true;
        // 🔹 FETCH FROM AUDIENCIAS FOR SPECIFIC NOTIFIER
        this.http.get<any[]>(`http://localhost:8080/api/audiencias/notificador/${userId}`).subscribe({
            next: (res) => {
                console.log("🔔 NOTIFICACIONES:", res);

                // 🔹 FIX: Mostrar todo lo que NO esté finalizado ni cancelado para asegurar que los datos aparezcan
                this.pendientes = res.filter(a => {
                    const estado = a.solicitud?.estado;
                    return estado !== 'FINALIZADO' && estado !== 'CANCELADO';
                });

                this.countPendientes = this.pendientes.length;
                this.countEntregadas = res.filter(a => a.solicitud?.estado === 'NOTIFICADO' || a.solicitud?.estado === 'ENTREGADO').length;
                // Mock urgente count
                this.countUrgente = this.pendientes.filter(p => p.urgente).length;

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
