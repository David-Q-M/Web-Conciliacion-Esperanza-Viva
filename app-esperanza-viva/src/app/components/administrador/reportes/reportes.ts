import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service'; // Importar servicio
import { UsuarioService } from '../../../services/usuario.service'; // Importar servicio

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes implements OnInit {
  usuarioActivo: string = '';

  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';

  // Datos crudos
  todasSolicitudes: any[] = [];

  // Datos procesados para la vista
  data: any = {
    totalSolicitudes: 0,
    tasaFinalizacion: 0,
    personalActivo: 0,
    pendientes: 0,
    asignados: 0,
    finalizadosContador: 0
  };

  listaPersonalCarga: any[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';

    // Inicializar fechas (último mes por defecto)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];

    this.cargarDatos();
  }

  cargarDatos() {
    // 1. Cargar Solicitudes
    this.solicitudService.listarSolicitudes().subscribe({
      next: (res: any[]) => {
        this.todasSolicitudes = res;
        this.filtrarReportes(); // Calcular estadísticas iniciales
      },
      error: (err) => console.error("Error cargando solicitudes", err)
    });

    // 2. Cargar Personal y calcular carga (simplificado)
    this.usuarioService.listarUsuarios().subscribe({
      next: (res: any[]) => {
        const personal = res.filter(u => u.rol !== 'ADMINISTRADOR' && u.estado === 'ACTIVO');
        this.data.personalActivo = personal.length;

        // Mapear carga de trabajo (esto requeriría lógica más compleja cruzando con solicitudes, 
        // por ahora mostramos la lista base)
        this.listaPersonalCarga = personal.map(p => ({
          ...p,
          cantidadCasos: 0 // Se actualizaría cruzando IDs con solicitudes
        }));
      }
    });
  }

  filtrarReportes() {
    const inicio = new Date(this.fechaInicio).getTime();
    const fin = new Date(this.fechaFin).getTime(); // Ajustar fin al final del día si es necesario

    // Filtrar por fecha de presentación
    const filtradas = this.todasSolicitudes.filter(s => {
      if (!s.fechaPresentacion) return false;
      const fechaSol = new Date(s.fechaPresentacion).getTime();
      return fechaSol >= inicio && fechaSol <= (fin + 86400000); // +1 día para incluir la fecha fin completa
    });

    // Calcular Estadísticas
    this.data.totalSolicitudes = filtradas.length;
    this.data.pendientes = filtradas.filter(s => s.estado === 'PENDIENTE').length;
    this.data.asignados = filtradas.filter(s => ['ASIGNADO', 'DESIGNACION_ACEPTADA', 'AUDIENCIA_PROGRAMADA'].includes(s.estado)).length;

    const finalizados = filtradas.filter(s => ['FINALIZADO', 'CONCLUIDO_SIN_ACUERDO', 'CONCLUIDO_CON_ACUERDO'].includes(s.estado));
    this.data.finalizadosContador = finalizados.length;

    this.data.tasaFinalizacion = this.data.totalSolicitudes > 0
      ? Math.round((this.data.finalizadosContador / this.data.totalSolicitudes) * 100)
      : 0;

    // Recalcular carga de trabajo real basada en solicitudes filtradas (opcional, avanzado)
  }

  exportarReporte() {
    alert("Funcionalidad de exportación a PDF/Excel simulada.\nSe descargarían las estadísticas del " + this.fechaInicio + " al " + this.fechaFin);
    // Aquí iría la lógica con jsPDF o ExcelJS
  }
  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}