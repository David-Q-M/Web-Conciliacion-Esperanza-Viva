import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './historial.html',
  styleUrls: ['./historial.css']
})
export class Historial implements OnInit, OnDestroy {
  casosCerrados: any[] = [];
  conciliadorNombre: string = '';
  isLoading: boolean = true;
  private intervalId: any;

  // Lista de estados que consideramos "Historial" (casos terminados)
  private estadosDeHistorial = [
    'FINALIZADA',
    'CERRADO',
    'CONCILIADA',
    'NO_ACUERDO',
    'INASISTENCIA_UNA_PARTE',
    'INASISTENCIA_AMBAS_PARTES',
    'CANCELADA'
  ];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    // Carga inicial
    this.cargarHistorial(true);

    // 🔄 Auto-actualización cada 10s (reducido frq)
    this.intervalId = setInterval(() => {
      this.cargarHistorial(false); // background update
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarHistorial(showLoading: boolean) {
    if (showLoading) this.isLoading = true;

    this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
      next: (res) => {
        // Filtramos por estados finales
        this.casosCerrados = res.filter(s => {
          const estadoNormalizado = s.estado ? s.estado.toUpperCase() : '';
          return this.estadosDeHistorial.includes(estadoNormalizado);
        }).sort((a, b) => (b.id || 0) - (a.id || 0));

        if (showLoading) setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error al cargar historial dinámico", err);
        this.isLoading = false;
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}