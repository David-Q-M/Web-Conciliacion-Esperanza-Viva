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
    // 🔹 UPDATED: Fetch ALL assigned cases to handle feedback loop (OBSERVADA)
    this.solicitudService.listarPorConciliador(conciliadorId).subscribe({
      next: (res) => {
        // Filter out closed cases (handled in Historial) but KEEP active workflow states, including exceptions like OBSERVADA
        this.expedientesOriginales = res.filter(e =>
          ['ASIGNADO', 'DESIGNACION_ACEPTADA', 'PROGRAMADO', 'NOTIFICADO', 'PENDIENTE_FIRMA', 'OBSERVADA', 'PENDIENTE_ACTA'].includes(e.estado)
        );
        this.expedientesFiltrados = this.expedientesOriginales;
        this.actualizarEstadisticas();
        setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error cargando expedientes:", err);
        this.isLoading = false;
      }
    });
  }

  actualizarEstadisticas() {
    this.stats.total = this.expedientesOriginales.length;
    this.stats.pendientes = this.expedientesOriginales.filter(e => e.estado === 'ASIGNADO').length;
    this.stats.enCurso = this.expedientesOriginales.filter(e => e.estado === 'DESIGNACION_ACEPTADA' || e.estado === 'PROGRAMADO' || e.estado === 'NOTIFICADO').length;
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