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
    styleUrls: ['./historial-notificador.css']
})
export class HistorialNotificador implements OnInit {
    notificadorNombre: string = 'Juan Perez';
    historial: any[] = [];
    isLoading: boolean = true;

    // Filters
    fechaInicio: string = '';
    fechaFin: string = '';
    estado: string = '';
    currentUserId: number | null = null;

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.notificadorNombre = user.nombreCompleto || this.notificadorNombre;
            this.currentUserId = user.id;
        }

        if (this.currentUserId) {
            this.buscarHistorial();
        } else {
            console.error("No user ID found for Notifier");
            this.isLoading = false;
        }
    }

    buscarHistorial() {
        if (!this.currentUserId) return;
        this.isLoading = true;
        this.http.get<any[]>(`http://localhost:8080/api/audiencias/notificador/${this.currentUserId}`).subscribe({
            next: (res) => {
                // 🔹 FIX: Mostrar todo el historial sin filtrar estrictamente por estado
                this.historial = res;
                // Optional: Client-side date filtering if dates are selected
                if (this.fechaInicio && this.fechaFin) {
                    // logic here if needed, but keeping it simple as requested
                }
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
        this.router.navigate(['/consulta']);
    }
}
