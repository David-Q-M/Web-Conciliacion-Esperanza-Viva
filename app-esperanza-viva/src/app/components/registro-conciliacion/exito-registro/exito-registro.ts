import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';
import { jsPDF } from 'jspdf';

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
    alert("Estado actualizado correctamente.");
  }

  descargarSolicitud() {
    if (!this.expediente) return;

    const doc = new jsPDF();
    const e = this.expediente;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(220, 53, 69); // Red color like in some documents or user theme
    doc.text("CENTRO DE CONCILIACIÓN ESPERANZA VIVA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Solicitud de Conciliación N° ${e.numeroExpediente}`, 105, 30, { align: "center" });

    // Body
    let y = 50;

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL SOLICITANTE:", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${e.solicitante?.nombres} ${e.solicitante?.apellidos}`, 20, y);
    y += 7;
    doc.text(`DNI: ${e.solicitante?.dni}`, 20, y);
    y += 7;
    doc.text(`Dirección: ${e.solicitante?.domicilio || 'No registrada'}`, 20, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL INVITADO:", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${e.invitado?.nombres} ${e.invitado?.apellidos}`, 20, y);
    y += 7;
    doc.text(`DNI: ${e.invitado?.dni}`, 20, y);
    y += 7;
    doc.text(`Dirección: ${e.invitado?.domicilio || 'No registrada'}`, 20, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA SOLICITUD:", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Materia: ${e.materiaConciliable}`, 20, y);
    y += 7;
    doc.text(`Fecha de Presentación: ${new Date(e.fechaCreacion).toLocaleDateString()}`, 20, y);
    y += 7;
    doc.text(`Estado Actual: ${e.estado}`, 20, y);

    if (e.hechos) {
      y += 15;
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPCIÓN DE LOS HECHOS:", 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      const splitHechos = doc.splitTextToSize(e.hechos, 170);
      doc.text(splitHechos, 20, y);
    }

    doc.save(`Solicitud_${e.numeroExpediente}.pdf`);
  }

  desistirSolicitud() {
    if (!confirm("¿Está seguro que desea desistir de esta solicitud? Esta acción no se puede deshacer.")) {
      return;
    }

    // Usamos el servicio para actualizar el estado a DESISTIDO
    // Nota: 'DESISTIDO' debe ser un estado válido en tu enum o lógica de negocio.
    // Si no tienes 'DESISTIDO', usa 'CANCELADO' o lo que corresponda.
    // Asumo 'CONCLUIDO_SIN_ACUERDO' o un estado similar si no hay 'DESISTIDO', 
    // pero idealmente debería ser 'DESISTIDO' o 'CANCELADO'.
    // Voy a usar 'CANCELADO' por seguridad si no estoy seguro del Enum, 
    // pero el usuario pidió "Desistir". Mapearé a 'CANCELADO' o 'NO_ACUERDO' si es necesario.
    // Revisando el Controller, acepta cualquier String. Usaré 'CANCELADO' para "Desistir".

    this.solicitudService.actualizarEstado(this.expediente.id, 'CANCELADO', 'Usuario desistió de la solicitud vía web')
      .subscribe({
        next: (res) => {
          alert("La solicitud ha sido cancelada exitosamente.");
          this.cargarDatos(); // Refresh data to show new status
        },
        error: (err) => {
          console.error("Error al desistir", err);
          alert("Hubo un error al intentar desistir de la solicitud.");
        }
      });
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
    if (targetState === 'APROBADA') {
      return ['APROBADA', 'APROBADO', 'ASIGNADO', 'PROGRAMADO', 'NOTIFICADO', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'PENDIENTE_FIRMA', 'PENDIENTE_ACTA', 'CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 2: Audiencia
    if (targetState === 'AUDIENCIA_PROGRAMADA') {
      return ['PROGRAMADO', 'NOTIFICADO', 'AUDIENCIA_PROGRAMADA', 'EN_AUDIENCIA', 'PENDIENTE_FIRMA', 'PENDIENTE_ACTA', 'CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO'].includes(current);
    }
    // Etapa 3: Finalizada
    if (targetState === 'FINALIZADA') {
      return ['CONCLUIDO', 'CONCLUIDO_SIN_ACUERDO', 'FINALIZADA', 'CONCILIADA', 'NO_ACUERDO', 'CANCELADO'].includes(current);
    }

    return false;
  }
}
