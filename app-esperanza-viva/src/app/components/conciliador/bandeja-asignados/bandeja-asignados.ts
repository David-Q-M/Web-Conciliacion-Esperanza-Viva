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
  expedientesOriginales: any[] = [];
  expedientesFiltrados: any[] = [];
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
        // Mantenemos los expedientes que están en el flujo activo de trabajo
        this.expedientesOriginales = res.filter(e =>
          ['ASIGNADO', 'DESIGNACION_ACEPTADA', 'PROGRAMADO', 'NOTIFICADO', 'PENDIENTE_FIRMA', 'OBSERVADA', 'PENDIENTE_ACTA'].includes(e.estado)
        );
        this.expedientesFiltrados = [...this.expedientesOriginales];
        this.actualizarEstadisticas();
        this.isLoading = false;
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
    // IMPORTANTE: 'En Proceso' ahora incluye casos ya programados pero no finalizados
    this.stats.enCurso = this.expedientesOriginales.filter(e =>
      ['DESIGNACION_ACEPTADA', 'PROGRAMADO', 'NOTIFICADO', 'PENDIENTE_ACTA'].includes(e.estado)
    ).length;
  }

  filtrarPorEstado(criterio: string) {
    this.filtroActual = criterio;
    if (criterio === 'TOTAL') {
      this.expedientesFiltrados = [...this.expedientesOriginales];
    } else if (criterio === 'PENDIENTES') {
      this.expedientesFiltrados = this.expedientesOriginales.filter(e => e.estado === 'ASIGNADO');
    } else if (criterio === 'CURSO') {
      // El filtro 'CURSO' ahora muestra todo lo que ya se aceptó y está en marcha
      this.expedientesFiltrados = this.expedientesOriginales.filter(e =>
        ['DESIGNACION_ACEPTADA', 'PROGRAMADO', 'NOTIFICADO'].includes(e.estado)
      );
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['consultar-expedientes']);
  }
}