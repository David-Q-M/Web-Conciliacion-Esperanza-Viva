import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-gestion-personal-director',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './personal.html',
  styleUrls: ['./personal.css']
})
export class GestionPersonal implements OnInit {
  personalOriginal: any[] = [];
  personalFiltrado: any[] = [];

  stats = { total: 0, activos: 0, conciliadores: 0, abogados: 0, notificadores: 0, secretarios: 0 };
  filtroActual: string = 'TOTAL';
  directorNombre: string = '';
  isLoading: boolean = true;

  constructor(private usuarioService: UsuarioService, private solicitudService: SolicitudService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.isLoading = true;

    // Usar forkJoin si fuera necesario, pero anidado es suficiente para este caso simple
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {

        // 🔹 2. Obtener Carga Laboral Real
        this.solicitudService.obtenerCargaLaboral().subscribe({
          next: (statsCarga) => {
            console.log("📊 Carga Laboral:", statsCarga);

            // 🔹 3. Procesar usuarios y fusionar carga
            const processedUsers = usuarios.map(u => {
              const rolesList = u.roles || [];
              const rolDisplay = rolesList.length > 0 ? rolesList.join(' / ') : 'SIN ROL';

              // Asignar carga real si es conciliador (ID en el mapa)
              const cargaReal = statsCarga[u.id] || 0;

              return {
                ...u,
                rol: rolDisplay,
                roles: rolesList,
                cargaAsignada: cargaReal // Propiedad para la barra de progreso
              };
            });

            // Exclude Administrators
            this.personalOriginal = processedUsers.filter(u => !u.roles.includes('ADMINISTRADOR'));
            this.personalFiltrado = this.personalOriginal;

            this.actualizarEstadisticas();
            setTimeout(() => this.isLoading = false, 500);
          },
          error: (err) => {
            console.error("Error cargando estadísticas de trabajo", err);
            // Si falla la carga laboral, mostramos los usuarios sin esa info
            // Copiar la lógica de éxito pero con carga 0
            const processedUsers = usuarios.map(u => {
              const rolesList = u.roles || [];
              const rolDisplay = rolesList.length > 0 ? rolesList.join(' / ') : 'SIN ROL';
              return {
                ...u,
                rol: rolDisplay,
                roles: rolesList,
                cargaAsignada: 0
              };
            });
            this.personalOriginal = processedUsers.filter(u => !u.roles.includes('ADMINISTRADOR'));
            this.personalFiltrado = this.personalOriginal;
            this.actualizarEstadisticas();
            this.isLoading = false;
          }
        });

      },
      error: (err) => {
        console.error("Error de acceso (403):", err);
        this.isLoading = false;
        if (err.status === 403) {
          alert("Error 403: No tiene permisos suficientes o su sesión expiró.");
          this.router.navigate(['/login-admin']);
        }
      }
    });
  }

  actualizarEstadisticas() {
    this.stats.total = this.personalOriginal.length;
    this.stats.activos = this.personalOriginal.filter(u => u.estado === 'ACTIVO').length;
    this.stats.conciliadores = this.personalOriginal.filter(u => u.roles.includes('CONCILIADOR')).length;
    this.stats.abogados = this.personalOriginal.filter(u => u.roles.includes('ABOGADO')).length;
    this.stats.notificadores = this.personalOriginal.filter(u => u.roles.includes('NOTIFICADOR')).length;
    this.stats.secretarios = this.personalOriginal.filter(u => u.roles.includes('SECRETARIO')).length;
  }

  /**
   * 🖱️ Filtrado reactivo por clic en cuadros superiores
   */
  filtrarPersonal(criterio: string) {
    this.filtroActual = criterio;
    if (criterio === 'TOTAL') {
      this.personalFiltrado = this.personalOriginal;
    } else if (criterio === 'ACTIVO') {
      this.personalFiltrado = this.personalOriginal.filter(u => u.estado === 'ACTIVO');
    } else {
      this.personalFiltrado = this.personalOriginal.filter(u => u.roles.includes(criterio));
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}