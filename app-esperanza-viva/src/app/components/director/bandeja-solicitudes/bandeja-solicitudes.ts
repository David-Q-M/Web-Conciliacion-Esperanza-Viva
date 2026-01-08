import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-bandeja-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bandeja-solicitudes.html',
  styleUrls: ['./bandeja-solicitudes.css']
})
export class BandejaSolicitudes implements OnInit {
  solicitudes: any[] = [];
  directorNombre: string = '';
  stats = { total: 0, pendientes: 0, revision: 0, aprobadas: 0 };

  constructor(private solicitudService: SolicitudService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudService.listarSolicitudes().subscribe({
      next: (res) => {
        this.solicitudes = res;
        this.stats.total = res.length;
        this.stats.pendientes = res.filter(s => s.estado === 'PENDIENTE').length;
        this.stats.revision = res.filter(s => s.estado === 'ASIGNADO').length;
        this.stats.aprobadas = res.filter(s => s.estado === 'FINALIZADO').length;
      },
      error: (err) => console.error("Error al conectar con la API de solicitudes", err)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}