import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-exito-registro',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exito-registro.html',
  styleUrls: ['./exito-registro.css']
})
export class ExitoRegistro implements OnInit, OnDestroy {
  expediente: any = null;
  cargando: boolean = true;
  private intervalId: any;
  conciliadores: any[] = [];

  // Orden de estados para el timeline
  private estadosOrder = ['RECIBIDO', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'];

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.cargarConciliadores();
    this.cargarDatos();
    // Polling cada 5 segundos para actualizar estado y conciliador
    this.intervalId = setInterval(() => {
      this.cargarDatos();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarConciliadores() {
    this.usuarioService.listarPorRol('CONCILIADOR').subscribe({
      next: (res) => {
        this.conciliadores = res;
        if (this.expediente) this.mapearConciliador();
      },
      error: (err) => console.error("Error cargando conciliadores", err)
    });
  }

  cargarDatos() {
    // Solo mostrar spinner si no hay datos aun
    if (!this.expediente) {
      this.cargando = true;
    }

    const numeroBusqueda = this.route.snapshot.paramMap.get('expediente');

    if (numeroBusqueda) {
      this.solicitudService.obtenerExpediente(numeroBusqueda).subscribe({
        next: (data) => {
          this.expediente = data;
          this.mapearConciliador();
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al conectar con MariaDB", err);
          this.cargando = false;
        }
      });
    }
  }

  mapearConciliador() {
    if (!this.expediente || !this.conciliadores.length) return;

    let cId = this.expediente.conciliadorId;
    // Caso: si conciliador es un ID numérico directamente
    if (!cId && typeof this.expediente.conciliador === 'number') {
      cId = this.expediente.conciliador;
    }
    // Caso: si conciliador es string pero numérico
    if (!cId && this.expediente.conciliador && !isNaN(Number(this.expediente.conciliador))) {
      cId = Number(this.expediente.conciliador);
    }

    if (cId) {
      const found = this.conciliadores.find(u => u.id === cId);
      if (found) {
        this.expediente.conciliador = found;
      }
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
    // Etapa 1: Aprobada (Incluye variaciones y estado ASIGNADO)
    // Etapa 1: Aprobada (Incluye variaciones y estado ASIGNADO)
    if (targetState === 'APROBADA') {
      return ['APROBADA', 'APROBADO', 'ASIGNADO', 'PROGRAMADO', 'NOTIFICADO', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'PENDIENTE_FIRMA', 'PENDIENTE_ACTA', 'CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 2: Audiencia
    if (targetState === 'AUDIENCIA_PROGRAMADA') {
      return ['PROGRAMADO', 'NOTIFICADO', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'PENDIENTE_FIRMA', 'PENDIENTE_ACTA', 'CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 3: Finalizada
    if (targetState === 'FINALIZADA') {
      return ['CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }

    return false;
  }
}
