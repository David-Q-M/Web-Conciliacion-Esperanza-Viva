import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-exito-registro',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exito-registro.html',
  styleUrls: ['./exito-registro.css']
})
export class ExitoRegistro implements OnInit {
  expediente: any = null;
  cargando: boolean = true;

  // Orden de estados para el timeline
  private estadosOrder = ['RECIBIDO', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'];

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    const numeroBusqueda = this.route.snapshot.paramMap.get('expediente');

    if (numeroBusqueda) {
      this.solicitudService.obtenerExpediente(numeroBusqueda).subscribe({
        next: (data) => {
          this.expediente = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al conectar con MariaDB", err);
          this.cargando = false;
        }
      });
    }
  }

  actualizarEstadoButton() {
    this.cargarDatos();
  }

  // Helper para el Timeline
  isStateAfterOrEqual(targetState: string): boolean {
    if (!this.expediente || !this.expediente.estado) return false;

    // Normalizamos para comparación simple
    const current = this.expediente.estado;

    // Si es el mismo, true
    if (current === targetState) return true;

    // Lógica manual simple si no hay orden estricto numérico, o usamos índices del array
    // Mapeo simplificado para la UI
    // Etapa 1: Aprobada
    if (targetState === 'APROBADA') {
      return ['APROBADA', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 2: Audiencia
    if (targetState === 'AUDIENCIA_PROGRAMADA') {
      return ['AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 3: Finalizada
    if (targetState === 'FINALIZADA') {
      return ['FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }

    return false;
  }
}
