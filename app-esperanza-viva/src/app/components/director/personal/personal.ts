import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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

  stats = { total: 0, activos: 0, conciliadores: 0, abogados: 0 };
  filtroActual: string = 'TOTAL';
  directorNombre: string = '';
  isLoading: boolean = true;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.isLoading = true;
    // 🛡️ SOLUCIÓN AL ERROR 403: Obtenemos el token del localStorage
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/usuarios-sistema', { headers }).subscribe({
      next: (res) => {
        // Filtramos para mostrar personal operativo (Tú como Director, Conciliadores y Abogados)
        this.personalOriginal = res.filter(u => u.rol !== 'ADMINISTRADOR');
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
    this.stats.conciliadores = this.personalOriginal.filter(u => u.rol === 'CONCILIADOR').length;
    this.stats.abogados = this.personalOriginal.filter(u => u.rol === 'ABOGADO').length;
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
      this.personalFiltrado = this.personalOriginal.filter(u => u.rol === criterio);
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}