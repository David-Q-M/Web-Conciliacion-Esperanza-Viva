import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-bandeja-asignados',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bandeja-asignados.html',
  styleUrls: ['./bandeja-asignados.css']
})
export class BandejaAsignados implements OnInit {
  expedientesOriginales: any[] = []; // Backup de la DB
  expedientesFiltrados: any[] = [];   // Lo que se muestra en pantalla
  conciliadorNombre: string = '';
  filtroActual: string = 'TOTAL';
  stats = { total: 0, pendientes: 0, enCurso: 0 };
  isLoading: boolean = true;

  constructor(private solicitudService: SolicitudService, private router: Router) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }

    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto || 'Conciliador';

    if (user.id) {
      this.cargarExpedientes(user.id);
    }
  }

  cargarExpedientes(conciliadorId: number) {
    this.isLoading = true;
    this.solicitudService.listarPorConciliador(conciliadorId).subscribe({
      next: (res) => {
        this.expedientesOriginales = res;
        this.expedientesFiltrados = res; // Por defecto mostrar todos
        this.actualizarEstadisticas();
        setTimeout(() => this.isLoading = false, 500); // UI Smoothness
      },
      error: (err) => {
        console.error("Error cargando expedientes:", err);
        this.isLoading = false;
      }
    });
  }

  actualizarEstadisticas() {
    this.stats.total = this.expedientesOriginales.length;
    // Pendientes: Aquellos que acaban de ser asignados por el Director
    this.stats.pendientes = this.expedientesOriginales.filter(e => e.estado === 'ASIGNADO').length;
    // En Curso: Aquellos que el conciliador ya aceptó (Designación Aceptada)
    this.stats.enCurso = this.expedientesOriginales.filter(e => e.estado === 'DESIGNACION_ACEPTADA').length;
  }

  /**
   * 🖱️ FILTRO POR CLIC EN CUADROS
   */
  filtrarPorEstado(criterio: string) {
    this.filtroActual = criterio;
    if (criterio === 'TOTAL') {
      this.expedientesFiltrados = this.expedientesOriginales;
    } else if (criterio === 'PENDIENTES') {
      this.expedientesFiltrados = this.expedientesOriginales.filter(e => e.estado === 'ASIGNADO');
    } else if (criterio === 'CURSO') {
      this.expedientesFiltrados = this.expedientesOriginales.filter(e => e.estado === 'DESIGNACION_ACEPTADA');
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['consulta']);
  }
}