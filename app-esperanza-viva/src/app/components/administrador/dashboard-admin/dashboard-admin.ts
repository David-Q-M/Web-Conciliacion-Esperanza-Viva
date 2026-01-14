import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdmin implements OnInit {
  stats = {
    totalExpedientes: 0,
    usuariosActivos: 0,
    pendientes: 0,
    finalizados: 0
  };

  // KPIs Avanzados
  kpis = {
    tasaAcuerdos: 0,
    tiempoPromedio: 0, // Días
    casosEstancados: 0
  };

  listaUsuariosActivos: any[] = [];
  alertasSistema: string[] = [];
  usuarioActivo: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarMetricas();
    this.cargarSesionesActivas();
  }

  cargarMetricas() {
    this.solicitudService.listarSolicitudes().subscribe({
      next: (solicitudes: any[]) => {
        this.stats.totalExpedientes = solicitudes.length;
        const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
        this.stats.pendientes = pendientes.length;

        const finalizados = solicitudes.filter(s => ['FINALIZADO', 'CONCLUIDO_SIN_ACUERDO', 'CONCLUIDO_CON_ACUERDO'].includes(s.estado));
        this.stats.finalizados = finalizados.length;

        // 1. Calcular Casos Estancados (> 3 días en PENDIENTE)
        const hoy = new Date();
        const estancados = pendientes.filter(s => {
          if (!s.fechaPresentacion) return false;
          const fechaSol = new Date(s.fechaPresentacion);
          const diffTime = Math.abs(hoy.getTime() - fechaSol.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 3;
        });
        this.kpis.casosEstancados = estancados.length;
        if (this.kpis.casosEstancados > 0) {
          this.alertasSistema.push(`⚠️ Tienes ${this.kpis.casosEstancados} expedientes sin asignar por más de 3 días.`);
        }

        // 2. Tasa de Acuerdos (Ejemplo: Casos con 'ACUERDO' vs Total Finalizados)
        if (this.stats.finalizados > 0) {
          const conAcuerdo = solicitudes.filter(s => s.resultadoTipo === 'ACUERDO_TOTAL' || s.estado === 'CONCLUIDO_CON_ACUERDO').length;
          this.kpis.tasaAcuerdos = Math.round((conAcuerdo / this.stats.finalizados) * 100);
        }

        // 3. Tiempo Promedio (Simulado si no hay fecha fin real, o calculado si existe)
        // Por ahora simularemos un valor realista basado en datos mock, idealmente backend
        this.kpis.tiempoPromedio = 5;
      },
      error: (err) => console.error("Error cargando expedientes", err)
    });

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios: any[]) => {
        // Usuarios activos en DB (no online)
        this.stats.usuariosActivos = usuarios.filter(u => u.estado === 'ACTIVO').length;
      },
      error: (err) => console.error("Error cargando usuarios", err)
    });
  }

  cargarSesionesActivas() {
    // Simulamos sesiones activas obteniendo los últimos logins de auditoría (últimos 30 min)
    this.http.get<any[]>('http://localhost:8080/api/auditoria').subscribe({
      next: (logs) => {
        // Filtramos logins recientes
        const loginsRecientes = logs
          .filter(l => l.accion === 'LOGIN')
          .slice(0, 5); // Tomamos los últimos 5 para mostrar

        // Mapeamos a un formato visual
        this.listaUsuariosActivos = loginsRecientes.map(l => ({
          nombre: l.usuarioNombre,
          hora: new Date(l.fechaHora).toLocaleTimeString(),
          rol: 'Usuario' // Idealmente cruzar con servicio de usuarios para sacar el rol, por ahora genérico
        }));
      },
      error: (err) => console.error("Error cargando logs", err)
    });
  }
}