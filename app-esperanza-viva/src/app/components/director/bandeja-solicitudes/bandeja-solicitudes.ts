import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
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
  stats = { total: 0, pendientes: 0, revision: 0, aprobadas: 0 };

  isLoading: boolean = true; // Flag de carga

  errorMessage: string = '';

  constructor(private solicitudService: SolicitudService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading = true; // Iniciar carga
    this.errorMessage = ''; // Limpiar errores previos
    this.solicitudService.listarSolicitudes().subscribe({
      next: (res) => {
        console.log("🔍 DATOS RECIBIDOS DEL BACKEND:", res);
        this.solicitudesOriginales = res;
        this.solicitudesFiltradas = res;
        this.actualizarEstadisticas(res);
        setTimeout(() => this.isLoading = false, 500); // Pequeño delay para suavizar la UX
      },
      error: (err) => {
        console.error("Error al conectar con la API", err);
        this.errorMessage = 'No se pudieron cargar los datos. Verifique su conexión o intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  actualizarEstadisticas(data: any[]) {
    this.stats.total = data.length;
    this.stats.pendientes = data.filter(s => s.estado === 'PENDIENTE').length;
    this.stats.revision = data.filter(s => s.estado === 'ASIGNADO').length;
    this.stats.aprobadas = data.filter(s => s.estado === 'FINALIZADO').length;
  }

  /**
   * 🖱️ Función para filtrar al hacer clic en los cuadros
   */
  filtrarPorEstado(estado: string) {
    this.estadoSeleccionado = estado;
    if (estado === 'TOTAL') {
      this.solicitudesFiltradas = this.solicitudesOriginales;
    } else {
      this.solicitudesFiltradas = this.solicitudesOriginales.filter(s => s.estado === estado);
    }
  }

  /**
   * 🔍 Buscador en tiempo real por expediente o nombre
   */
  buscar() {
    const busqueda = this.filtroTexto.toLowerCase();
    this.solicitudesFiltradas = this.solicitudesOriginales.filter(s =>
      s.numeroExpediente?.toLowerCase().includes(busqueda) ||
      s.solicitante?.nombres?.toLowerCase().includes(busqueda) ||
      s.invitado?.nombres?.toLowerCase().includes(busqueda)
    );
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}