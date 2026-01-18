import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bandeja-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './bandeja-solicitudes.html',
  styleUrls: ['./bandeja-solicitudes.css']
})
export class BandejaSolicitudes implements OnInit {
  solicitudesOriginales: any[] = []; // Base de datos completa
  solicitudesFiltradas: any[] = [];  // Lo que se muestra en la tabla

  directorNombre: string = '';
  filtroTexto: string = '';
  estadoSeleccionado: string = 'TOTAL';

  // Estadísticas reales
  stats = {
    total: 0,
    pendientes: 0,
    observadas: 0,
    finalizadas: 0,
    sinAcuerdo: 0,
    conciliadoresActivos: 0
  };

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private solicitudService: SolicitudService, private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading = true;
    this.errorMessage = '';

    // 1. Obtener conteo de conciliadores activos
    this.usuarioService.contarPorRol('CONCILIADOR').subscribe({
      next: (count) => this.stats.conciliadoresActivos = count,
      error: (err) => console.error("Error contando conciliadores", err)
    });

    // Director ve TODO (Macro Visión)
    this.solicitudService.listarTodas().subscribe({
      next: (res) => {
        console.log("🔍 TODAS LAS SOLICITUDES:", res);
        this.solicitudesOriginales = res;
        this.solicitudesFiltradas = res; // Mostrar todo al inicio
        this.actualizarEstadisticas(res);
        setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error al conectar con la API", err);
        this.errorMessage = 'No se pudieron cargar los datos.';
        this.isLoading = false;
      }
    });
  }

  actualizarEstadisticas(data: any[]) {
    this.stats.total = data.length;
    this.stats.pendientes = data.filter(s => s.estado === 'PENDIENTE').length;
    this.stats.observadas = data.filter(s => s.estado === 'OBSERVADA').length;
    // FINALIZADA o APROBADA se consideran casos de éxito
    this.stats.finalizadas = data.filter(s => ['FINALIZADA', 'APROBADA'].includes(s.estado)).length;
    this.stats.sinAcuerdo = data.filter(s => s.estado === 'CONCLUIDO_SIN_ACUERDO').length;
  }

  filtrarPorEstado(estado: string) {
    this.estadoSeleccionado = estado;
    if (estado === 'TOTAL') {
      this.solicitudesFiltradas = this.solicitudesOriginales;
    } else if (estado === 'FINALIZADA') {
      // Agrupar estados de éxito
      this.solicitudesFiltradas = this.solicitudesOriginales.filter(s => ['FINALIZADA', 'APROBADA'].includes(s.estado));
    } else {
      this.solicitudesFiltradas = this.solicitudesOriginales.filter(s => s.estado === estado);
    }
  }

  buscar() {
    const busqueda = this.filtroTexto.toLowerCase();
    this.solicitudesFiltradas = this.solicitudesOriginales.filter(s =>
      (s.numeroExpediente && s.numeroExpediente.toLowerCase().includes(busqueda)) ||
      (s.solicitanteNombre && s.solicitanteNombre.toLowerCase().includes(busqueda)) ||
      (s.invitadoNombre && s.invitadoNombre.toLowerCase().includes(busqueda))
    );
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}
