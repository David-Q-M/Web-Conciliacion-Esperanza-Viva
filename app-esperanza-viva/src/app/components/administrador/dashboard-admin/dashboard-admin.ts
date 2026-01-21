import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
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

  listaUsuariosDb: any[] = [];
  listaUsuariosActivos: any[] = [];
  alertasSistema: string[] = [];
  usuarioActivo: string = '';
  errorMessage: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    // 1. Cargar Usuarios primero para mapeo de Roles
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.listaUsuariosDb = usuarios;
        this.stats.usuariosActivos = usuarios.filter(u => u.estado === 'ACTIVO').length;

        // 2. Cargar Métricas de Solicitudes
        this.cargarMetricasSolicitudes();

        // 3. Cargar Sesiones desde Auditoría (Logs recientes)
        this.cargarSesionesActivas();
      },
      error: (err) => {
        console.error("Error cargando usuarios", err);
        this.errorMessage = 'No se pudieron cargar los datos del sistema. Verifique la conexión con el servidor.';
      }
    });
  }

  cargarMetricasSolicitudes() {
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
          // Diferencia en días
          const diffTime = Math.abs(hoy.getTime() - fechaSol.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 3;
        });

        this.kpis.casosEstancados = estancados.length;
        if (this.kpis.casosEstancados > 0) {
          // Evitar duplicados si se recarga
          const msg = `⚠️ Tienes ${this.kpis.casosEstancados} expedientes sin asignar por más de 3 días.`;
          if (!this.alertasSistema.includes(msg)) this.alertasSistema.push(msg);
        }

        // 2. Tasa de Acuerdos
        if (this.stats.finalizados > 0) {
          const conAcuerdo = solicitudes.filter(s => s.resultadoTipo === 'ACUERDO_TOTAL' || s.estado === 'CONCLUIDO_CON_ACUERDO').length;
          this.kpis.tasaAcuerdos = Math.round((conAcuerdo / this.stats.finalizados) * 100);
        }

        // 3. Tiempo Promedio Real (Basado en casos finalizados)
        if (this.stats.finalizados > 0) {
          const tiempos = finalizados.map(s => {
            if (!s.fechaPresentacion) return 0;
            const inicio = new Date(s.fechaPresentacion).getTime();
            // Si tiene fecha audiencia usamos esa, sino fecha actual (como aproximación de cierre)
            const fin = s.fechaAudiencia ? new Date(s.fechaAudiencia).getTime() : new Date().getTime();
            const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
            return dias > 0 ? dias : 0;
          });

          const sumaTiempos = tiempos.reduce((a, b) => a + b, 0);
          this.kpis.tiempoPromedio = Math.round(sumaTiempos / this.stats.finalizados);
        } else {
          this.kpis.tiempoPromedio = 0;
        }
      },
      error: (err) => console.error("Error cargando expedientes", err)
    });
  }

  cargarSesionesActivas() {
    this.http.get<any[]>(`${environment.apiUrl}/auditoria`).subscribe({
      next: (logs) => {
        // 1. Ordenar por fecha descendente (lo más reciente primero)
        // Usamos una función robusta por si la fecha viene como string o timestamp
        const logsOrdenados = logs.sort((a, b) => {
          const dateA = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
          const dateB = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;
          return dateB - dateA;
        });

        // 2. Obtener usuarios únicos que han tenido CUALQUIER actividad reciente
        // Esto es más robusto que solo filtrar 'LOGIN', ya que muestra quien está trabajando
        const usuariosUnicos = new Map();
        logsOrdenados.forEach(l => {
          if (l.usuarioNombre && !usuariosUnicos.has(l.usuarioNombre)) {
            usuariosUnicos.set(l.usuarioNombre, l);
          }
        });

        // Tomar los últimos 8 usuarios activos
        const actividadReciente = Array.from(usuariosUnicos.values()).slice(0, 8);

        // 3. Mapear con Roles reales de la DB
        this.listaUsuariosActivos = actividadReciente.map((l: any) => {
          const usuarioDb = this.listaUsuariosDb.find(u => u.usuario === l.usuarioNombre || u.nombreCompleto === l.usuarioNombre);

          // Obtener rol principal o 'Usuario'
          let rolMostrar = 'Usuario';
          if (usuarioDb && usuarioDb.roles && usuarioDb.roles.length > 0) {
            rolMostrar = usuarioDb.roles[0]; // Mostrar el primer rol
          } else if (usuarioDb && usuarioDb.rol) {
            rolMostrar = usuarioDb.rol; // Fallback
          }

          return {
            nombre: l.usuarioNombre,
            hora: new Date(l.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rol: rolMostrar,
            estado: l.accion === 'LOGIN' ? 'Conectado' : 'Activo' // 'Conectado' si fue login, 'Activo' si hizo otra cosa
          };
        });
      },
      error: (err) => console.error("Error cargando logs", err)
    });
  }
}
