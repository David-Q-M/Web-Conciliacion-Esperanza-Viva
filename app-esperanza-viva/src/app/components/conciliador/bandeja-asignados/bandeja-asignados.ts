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
  expedientes: any[] = [];
  conciliadorNombre: string = '';
  stats = { total: 0, pendientes: 0, enCurso: 0 };

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
    } else {
      console.warn("No se encontró ID en el usuario logueado, cargando todas (fallback)");
      // Fallback por si acaso es un admin viendo esto o error de data
      this.solicitudService.listarSolicitudes().subscribe(res => this.procesarRespuesta(res));
    }
  }

  cargarExpedientes(conciliadorId: number) {
    this.solicitudService.listarPorConciliador(conciliadorId).subscribe({
      next: (res) => this.procesarRespuesta(res),
      error: (err) => console.error("Error en API:", err)
    });
  }

  procesarRespuesta(res: any[]) {
    // 🔹 Asignamos TODOS los casos devueltos por la API (que ya viene filtrada por conciliador)
    this.expedientes = res;

    this.stats.total = this.expedientes.length;
    // Pendientes: Estado exacto de asignación inicial
    this.stats.pendientes = this.expedientes.filter(e => e.estado === 'ASIGNADO' || e.estado === 'Asignado').length;
    // En curso: Designación aceptada u otros estados activos si hubieran
    this.stats.enCurso = this.expedientes.filter(s => s.estado === 'DESIGNACION_ACEPTADA').length;
  }

  cerrarSesion() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login-admin']);
  }
}