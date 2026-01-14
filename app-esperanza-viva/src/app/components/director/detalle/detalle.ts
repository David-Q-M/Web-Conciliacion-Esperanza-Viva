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
  conciliadorSeleccionado: any = null; 
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
      next: (res) => {
        this.expediente = res;
        console.log("Datos cargados de MariaDB:", res);
      },
      error: (err) => console.error("Error al cargar expediente:", err)
    });
  }

  cargarConciliadores() {
    this.usuarioService.listarPorRol('CONCILIADOR').subscribe(res => {
      this.conciliadores = res.map((u: any) => ({
        ...u,
        // Unificamos nombre y estado para que se vea profesional en el select
        labelMenu: `${u.nombre_completo || u.nombreCompleto} — ${u.estado === 'ACTIVO' ? 'Disponible' : 'Ocupado'}`
      }));
    });
  }

  // Se dispara al elegir un profesional en el desplegable
  onConciliadorChange() {
    this.conciliadorSeleccionado = this.conciliadores.find(c => c.id == this.conciliadorId);
  }

  actualizarEstado(nuevoEstado: string) {
    if ((nuevoEstado === 'OBSERVADO' || nuevoEstado === 'RECHAZADO') && !this.observacionTexto) {
      this.mostrarModal = true;
      return;
    }
    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, this.observacionTexto).subscribe({
      next: () => {
        this.expediente.status = nuevoEstado;
        this.mostrarModal = false;
        alert("Estado actualizado correctamente a: " + nuevoEstado);
      }
    });
  }

  confirmarDesignacion() {
    if (!this.conciliadorId) return;
    this.solicitudService.designarConciliador(this.expediente.id, this.conciliadorId).subscribe(() => {
      alert("Designación guardada exitosamente en la base de datos.");
      this.router.navigate(['/director/bandeja-solicitudes']);
    });
  }
}