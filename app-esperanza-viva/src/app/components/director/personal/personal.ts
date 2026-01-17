import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';

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

  stats = { total: 0, activos: 0, conciliadores: 0, abogados: 0, notificadores: 0 };
  filtroActual: string = 'TOTAL';
  directorNombre: string = '';
  isLoading: boolean = true;

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.isLoading = true;

    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => {
        // Map roles for easier handling and filtered 'ADMINISTRADOR'
        const processedUsers = res.map(u => {
          // Ensure roles is treated as an array
          const rolesList = u.roles || [];
          // Create a display-friendly role string
          const rolDisplay = rolesList.length > 0 ? rolesList.join(' / ') : 'SIN ROL';
          return { ...u, rol: rolDisplay, roles: rolesList };
        });

        // Exclude Administrators
        this.personalOriginal = processedUsers.filter(u => !u.roles.includes('ADMINISTRADOR'));
        this.personalFiltrado = this.personalOriginal;

        this.actualizarEstadisticas();
        setTimeout(() => this.isLoading = false, 500);
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