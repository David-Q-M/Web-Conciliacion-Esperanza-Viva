import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-generar-acta-suspension',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './generar-acta-suspension.html',
    styleUrls: ['./generar-acta-suspension.css']
})
export class GenerarActaSuspension implements OnInit {
    audienciaId: any;
    expediente: any = {};
    abogados: any[] = [];
    conciliadorNombre: string = '';

    acta = {
        antecedentes: '',
        controversias: '',
        abogadoVerificadorId: null,
        // No clauses required for suspension
    };

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
            this.router.navigate(['/login-admin']);
            return;
        }
        const user = JSON.parse(userJson);
        this.conciliadorNombre = user.nombreCompleto;

        this.audienciaId = this.route.snapshot.paramMap.get('id');
        if (this.audienciaId) {
            this.cargarDatos();
            this.cargarAbogados();
        }
    }

    cargarDatos() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (audiencia) => {
                if (audiencia.solicitud) {
                    this.expediente = audiencia.solicitud;
                    this.acta.antecedentes = audiencia.solicitud.hechos || '';
                } else {
                    console.warn("La audiencia no tiene solicitud vinculada directamente.");
                }
            },
            error: (err) => console.error("Error al obtener datos de la audiencia", err)
        });
    }

    cargarAbogados() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<any[]>('http://localhost:8080/api/usuarios-sistema', { headers }).subscribe({
            next: (res) => {
                this.abogados = res.filter(u => u.rol === 'ABOGADO' && u.estado === 'ACTIVO');
            },
            error: (err) => console.error("Error al cargar abogados", err)
        });
    }

    emitirActaFinal() {
        if (!this.acta.antecedentes || this.acta.antecedentes.trim().length < 10) {
            alert("Los antecedentes son obligatorios y deben ser detallados.");
            return;
        }

        if (!this.acta.controversias || this.acta.controversias.trim().length < 10) {
            alert("La descripción de las controversias es obligatoria.");
            return;
        }

        if (!this.acta.abogadoVerificadorId) {
            alert("Es obligatorio seleccionar un abogado verificador.");
            return;
        }

        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        if (!this.expediente || !this.expediente.id) {
            alert("Error crítico: No se ha identificado la solicitud asociada. Recargue la página.");
            return;
        }

        const payload = {
            solicitudId: this.expediente.id, // ID correcto para el backend
            audienciaId: this.audienciaId,   // Enviamos también el ID de audiencia por si acaso el backend lo usa
            antecedentes: this.acta.antecedentes,
            controversias: this.acta.controversias,
            abogadoVerificadorId: this.acta.abogadoVerificadorId,
            clausulas: [], // Array vacío para indicar suspensión/sin acuerdo
            tipoActa: 'SUSPENSION' // Flag explícito para ayudar al backend si tiene lógica discriminada
        };

        this.http.post(`http://localhost:8080/api/audiencias/finalizar`, payload, { headers }).subscribe({
            next: () => {
                alert("¡Acta de Suspensión Emitida con éxito!");
                this.router.navigate(['/conciliador/mis-casos']);
            },
            error: (err) => alert("Error al emitir el acta: " + err.message)
        });
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/login-admin']);
    }
}
