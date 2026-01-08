import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-evaluar-designacion',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './evaluar-designacion.html',
  styleUrls: ['./evaluar-designacion.css']
})
export class EvaluarDesignacion implements OnInit {
  expediente: any = null;
  cargando: boolean = true;
  conciliadorNombre: string = '';

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 🛡️ Validación de sesión para evitar que el sistema te "bote"
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }

    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarExpediente(Number(id));
    }
  }

  cargarExpediente(id: number) {
    this.solicitudService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.expediente = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar expediente:", err);
        this.router.navigate(['/conciliador/mis-casos']);
      }
    });
  }

  responder(aceptado: boolean) {
    // 🔹 Estados vinculados a MariaDB y Wireframe 40
    const nuevoEstado = aceptado ? 'DESIGNACION_ACEPTADA' : 'ASIGNADO';
    const observacion = aceptado ? 'Conciliador aceptó la designación' : 'Conciliador declinó la designación';

    // Usamos actualizarEstado del servicio
    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, observacion).subscribe({
      next: () => {
        if (aceptado) {
          this.router.navigate(['/conciliador/programar', this.expediente.id]);
        } else {
          this.router.navigate(['/conciliador/mis-casos']);
        }
      },
      error: (err) => alert("Error en el servidor: " + err.message)
    });
  }
}