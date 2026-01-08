import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  // Coincide con las cajas del Wireframe 33
  stats = { 
    totalExpedientes: 0, 
    usuariosActivos: 0, 
    pendientes: 0, 
    finalizados: 0 
  };
  usuarioActivo: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarMetricas();
  }

  cargarMetricas() {
    this.solicitudService.listarSolicitudes().subscribe({
      next: (solicitudes: any[]) => {
        this.stats.totalExpedientes = solicitudes.length;
        this.stats.pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;
        this.stats.finalizados = solicitudes.filter(s => s.estado === 'FINALIZADO').length;
      },
      error: (err) => console.error("Error cargando expedientes", err)
    });

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.stats.usuariosActivos = usuarios.filter(u => u.estado === 'ACTIVO').length;
      },
      error: (err) => console.error("Error cargando usuarios", err)
    });
  }
}