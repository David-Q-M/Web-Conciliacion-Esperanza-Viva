import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudienciaService } from '../../../services/audiencia.service';

@Component({
  selector: 'app-agenda-conciliador',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css']
})
export class AgendaConciliador implements OnInit {
  conciliadorNombre: string = '';
  // Listas para separar lógica visual
  audiencias: any[] = [];

  listaOriginal: any[] = []; // Base completa para filtros

  isLoading: boolean = true;
  filtroActual: string = 'TODOS'; // 'TODOS' (Programado/Notificado), 'HISTORIAL'

  constructor(private audienciaService: AudienciaService, private router: Router) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;
    this.cargarAgenda(user.id);
  }

  cargarAgenda(id: number) {
    this.isLoading = true;
    this.audienciaService.listarPorConciliador(id).subscribe({
      next: (res) => {
        // Mapeo seguro de datos para la vista (Flat Objects)
        this.listaOriginal = res.map((a: any) => ({
          id: a.id,
          numeroExpediente: a.solicitud?.numeroExpediente || '---',
          fechaAudiencia: a.fechaAudiencia,
          horaAudiencia: a.horaAudiencia,
          lugar: a.lugar || 'Centro de Conciliación',
          estado: a.solicitud?.estado || 'PROGRAMADO', // El estado suele estar en la solicitud

          // Datos de Personas
          solicitanteNombre: a.solicitud?.solicitanteNombre || (a.solicitud?.solicitante ? `${a.solicitud.solicitante.nombres} ${a.solicitud.solicitante.apellidos}` : '---'),
          solicitanteApellido: '', // Integrado en nombre arriba
          invitadoNombre: a.solicitud?.invitadoNombre || (a.solicitud?.invitado ? `${a.solicitud.invitado.nombres} ${a.solicitud.invitado.apellidos}` : '---'),
          invitadoApellido: '',

          materia: a.solicitud?.materiaConciliable || 'General',

          // Helpers
          esProgramado: (a.solicitud?.estado === 'PROGRAMADO'),
          esNotificado: (a.solicitud?.estado === 'NOTIFICADO')
        }));

        this.filtrarPrincipal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error cargando agenda:", err);
        this.isLoading = false;
      }
    });
  }

  // Muestra solo lo activo por defecto
  filtrarPrincipal() {
    this.filtroActual = 'TODOS'; // Alias para "Activos"
    // DEBUG: Mostrar todo provisionalmente para ver qué estados llegan
    this.audiencias = this.listaOriginal;
    /*
    this.audiencias = this.listaOriginal.filter(a => 
      ['PROGRAMADO', 'NOTIFICADO'].includes(a.estado)
    );
    */
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}
