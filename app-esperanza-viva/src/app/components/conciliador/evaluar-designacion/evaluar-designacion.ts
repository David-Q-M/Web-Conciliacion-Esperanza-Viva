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
        console.error("Error al conectar con MariaDB:", err);
        this.router.navigate(['/conciliador/mis-casos']);
      }
    });
  }

  responder(aceptado: boolean) {
    // 🛡️ Estados sincronizados con el flujo legal (ASIGNADO -> DESIGNACION_ACEPTADA)
    const nuevoEstado = aceptado ? 'DESIGNACION_ACEPTADA' : 'ASIGNADO';
    const msg = aceptado ? 'Ha aceptado el caso con éxito.' : 'Ha declinado la designación.';

    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, msg).subscribe({
      next: () => {
        alert(msg);
        if (aceptado) {
          // Si acepta, va directo a Programar Audiencia (Wireframe 41)
          this.router.navigate(['/conciliador/programar', this.expediente.id]);
        } else {
          // Si declina, vuelve a su bandeja
          this.router.navigate(['/conciliador/mis-casos']);
        }
      },
      error: (err) => alert("Error en el servidor al actualizar estado: " + err.message)
    });
  }
}