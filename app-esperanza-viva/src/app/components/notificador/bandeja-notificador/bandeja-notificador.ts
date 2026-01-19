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
    originalList: any[] = [];
    filteredList: any[] = [];
    filterType: 'PENDIENTES' | 'ENTREGADAS' | 'URGENTE' = 'PENDIENTES';
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
        this.http.get<any[]>(`https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/notificador/${userId}`).subscribe({
            next: (res) => {
                console.log("🔔 NOTIFICACIONES:", res);
                this.originalList = res || [];

                // Calcular contadores
                this.countPendientes = this.originalList.filter(a => a.solicitud?.estado === 'PROGRAMADO').length;
                this.countEntregadas = this.originalList.filter(a => ['NOTIFICADO', 'ENTREGADO', 'FINALIZADO'].includes(a.solicitud?.estado)).length;
                this.countUrgente = this.originalList.filter(p => p.urgente).length;

                // Aplicar filtro inicial
                this.aplicarFiltro('PENDIENTES');
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error cargando notificaciones", err);
                this.isLoading = false;
            }
        });
    }

    aplicarFiltro(tipo: 'PENDIENTES' | 'ENTREGADAS' | 'URGENTE') {
        this.filterType = tipo;
        if (tipo === 'PENDIENTES') {
            // Mostrar PROGRAMADO (lo que debe notificar)
            this.filteredList = this.originalList.filter(a => a.solicitud?.estado === 'PROGRAMADO');
        } else if (tipo === 'ENTREGADAS') {
            // Mostrar ya notificados
            this.filteredList = this.originalList.filter(a => ['NOTIFICADO', 'ENTREGADO', 'FINALIZADO'].includes(a.solicitud?.estado));
        } else if (tipo === 'URGENTE') {
            this.filteredList = this.originalList.filter(a => a.urgente);
        }
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
