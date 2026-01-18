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

  listaPersonalBase: any[] = [];
  listaPersonalCarga: any[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';

    // Inicializar fechas (Desde el 1 de Enero del 2024 para ver todo)
    const hoy = new Date();
    // Default to Jan 1st, 2024 to ensure historical data is seen
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = '2024-01-01';

    this.cargarDatos();
  }

  cargarDatos() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res: any[]) => {
        // Filtrar personal activo (no Admin)
        const personal = res.filter(u => u.rol !== 'ADMINISTRADOR' && u.estado === 'ACTIVO');
        this.data.personalActivo = personal.length;

        // Inicializar base con contador 0
        this.listaPersonalBase = personal.map(p => ({ ...p, cantidadCasos: 0 }));

        // Cargar solicitudes tambien (ya no depende de usuarios)
      },
      error: (err) => {
        console.error("Error cargando usuarios", err);
        // Aun si falla usuarios, intentamos cargar solicitudes
      }
    });

    // Cargar solicitudes en paralelo
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudService.listarSolicitudes().subscribe({
      next: (res: any[]) => {
        console.log("🔍 REPORTES - SOLICITUDES RECIBIDAS:", res);
        this.todasSolicitudes = res;
        this.filtrarReportes(); // Calcular estadísticas iniciales
      },
      error: (err) => {
        console.error("Error cargando solicitudes", err);
        alert("Error al cargar reportes. Ver Consola.");
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

    // Recalcular carga de trabajo real basada en solicitudes filtradas
    // 1. Resetear contadores
    this.listaPersonalBase.forEach(p => p.cantidadCasos = 0);

    // 2. Contar asignaciones
    filtradas.forEach(s => {
      // Contar Conciliador
      if (s.conciliadorId) {
        const personal = this.listaPersonalBase.find(p => p.id === s.conciliadorId);
        if (personal) personal.cantidadCasos++;
      }
      // Contar Notificador (si aplica - aunque el DTO actual no tiene notificadorId, se puede agregar despues si es critico)
      // Por ahora comentamos notificador si no está en DTO, o asumimos que no se cuenta aqui
    });

    // 3. Actualizar lista visible y ordenar por mayor carga
    this.listaPersonalCarga = [...this.listaPersonalBase].sort((a, b) => b.cantidadCasos - a.cantidadCasos);

    // 4. Exponer datos filtrados para la tabla de detalle
    this.solicitudesFiltradas = filtradas;
  }

  // Datos para la tabla de detalle
  solicitudesFiltradas: any[] = [];

  exportarReporte() {
    if (this.solicitudesFiltradas.length === 0) {
      alert("No hay datos para exportar en este rango de fechas.");
      return;
    }

    // Generar CSV
    const headers = ["Nro Expediente", "Fecha", "Solicitante", "Conciliador", "Estado", "Resultado"];
    const rows = this.solicitudesFiltradas.map(s => [
      s.numeroExpediente,
      s.fechaPresentacion,
      s.solicitanteNombre || 'Sin Nombre',
      s.conciliadorNombre || 'Sin Asignar',
      s.estado,
      s.resultadoTipo || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_esperanza_viva_${this.fechaInicio}_${this.fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}
