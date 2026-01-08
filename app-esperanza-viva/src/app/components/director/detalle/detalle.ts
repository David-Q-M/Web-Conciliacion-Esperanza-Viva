import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-detalle-director',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.css']
})
export class DetalleDirector implements OnInit {
  expediente: any = {};
  conciliadores: any[] = [];
  conciliadorId: any = null;
  mostrarModal = false;
  observacionTexto = '';

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(Number(id));
      this.cargarConciliadores();
    }
  }

  cargarDetalle(id: number) {
    this.solicitudService.obtenerPorId(id).subscribe({
      next: (res) => this.expediente = res,
      error: (err) => console.error("Error al cargar expediente:", err)
    });
  }

  cargarConciliadores() {
    this.usuarioService.listarPorRol('CONCILIADOR').subscribe({
      next: (res) => {
        this.conciliadores = res.filter(u => u.estado === 'ACTIVO');
      },
      error: (err) => console.error("Error al cargar conciliadores:", err)
    });
  }

  abrirModalObservacion() { this.mostrarModal = true; }

  actualizarEstado(nuevoEstado: string) {
    if ((nuevoEstado === 'OBSERVADO' || nuevoEstado === 'RECHAZADO') &&
      (!this.observacionTexto || this.observacionTexto.trim().length < 5)) {
      alert("Para cambiar el estado a " + nuevoEstado + ", debe ingresar una observación detallada.");
      return;
    }

    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, this.observacionTexto).subscribe({
      next: () => {
        this.mostrarModal = false;
        alert("Estado actualizado a " + nuevoEstado);
        // 🔹 Cambio: Actualizamos el estado localmente para que se refleje en la UI sin navegar
        this.expediente.estado = nuevoEstado;

        // Si se rechazó u observó, quizás sí queramos volver, pero si se aprobó, nos quedamos para designar
        if (nuevoEstado !== 'APROBADO' && nuevoEstado !== 'PENDIENTE') {
          this.router.navigate(['/director/bandeja-solicitudes']);
        }
      },
      error: (err) => alert("Error: " + err.message)
    });
  }

  // 🔹 NUEVO: Se conecta con la funcionalidad que acabamos de agregar al backend
  generarFormatoB() {
    if (!this.conciliadorId) {
      alert("Debe seleccionar un conciliador");
      return;
    }

    // Llamamos al método designar (necesitaremos agregarlo al servicio también)
    this.solicitudService.designarConciliador(this.expediente.id, this.conciliadorId).subscribe({
      next: () => {
        alert("Conciliador designado correctamente. El expediente aparecerá en su bandeja.");
        this.router.navigate(['/director/bandeja-solicitudes']);
      },
      error: (err) => {
        console.error(err);
        alert("Error al designar conciliador");
      }
    });
  }
}