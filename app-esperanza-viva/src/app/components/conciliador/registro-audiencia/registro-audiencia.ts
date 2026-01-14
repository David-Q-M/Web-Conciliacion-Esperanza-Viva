import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './registro-audiencia.html',
  styleUrls: ['./registro-audiencia.css']
})
export class RegistroAudiencia implements OnInit {
  audiencia: any = null;
  conciliadorNombre: string = '';

  // Control de UI para desplegables dinámicos
  resultadoSeleccionado: string = '';
  subResultado: string = '';

  // Control manual de dropdowns
  showSolicitanteDropdown: boolean = false;
  showInvitadoDropdown: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.conciliadorNombre = JSON.parse(userJson).nombreCompleto;
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'undefined') {
        this.cargarDatosAudiencia(id);
      }
    });

    // Cerrar dropdowns si se hace clic fuera (opcional, por ahora básico)
    document.addEventListener('click', (event: any) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        this.showSolicitanteDropdown = false;
        this.showInvitadoDropdown = false;
      }
    });
  }

  cargarDatosAudiencia(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://localhost:8080/api/audiencias/${id}`, { headers }).subscribe({
      next: (res: any) => {
        this.audiencia = res;
        // 🛡️ Sincronización crucial: Si en DB es null o Boolean, lo mapeamos a String para la UI
        this.audiencia.asistenciaSolicitante = res.asistenciaSolicitante === true || res.asistenciaSolicitante === 'Asistio' ? 'Asistio' : 'No asistio';
        this.audiencia.asistenciaInvitado = res.asistenciaInvitado === true || res.asistenciaInvitado === 'Asistio' ? 'Asistio' : 'No asistio';
      },
      error: (err) => console.error("Error al cargar datos:", err)
    });
  }

  toggleSolicitante() {
    this.showSolicitanteDropdown = !this.showSolicitanteDropdown;
    this.showInvitadoDropdown = false; // Cierra el otro
  }

  toggleInvitado() {
    this.showInvitadoDropdown = !this.showInvitadoDropdown;
    this.showSolicitanteDropdown = false; // Cierra el otro
  }

  // 🔄 IMPLEMENTACIÓN CORREGIDA: Cambia el estado y refresca la UI inmediatamente
  cambiarAsistencia(parte: 'solicitante' | 'invitado', valor: string) {
    console.log(`Cambiando ${parte} a: ${valor}`);

    if (this.audiencia) {
      if (parte === 'solicitante') {
        this.audiencia.asistenciaSolicitante = valor;
        this.showSolicitanteDropdown = false;
      } else {
        this.audiencia.asistenciaInvitado = valor;
        this.showInvitadoDropdown = false;
      }

      // 🛡️ Forzamos a Angular a redibujar el botón con el nuevo color (Verde/Rojo)
      this.cdr.detectChanges();
    }
  }

  finalizarProceso() {
    if (!this.resultadoSeleccionado) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 🛡️ Antes de enviar, convertimos a lo que el Backend espera (Strings profesionales)
    const payload = {
      asistenciaSolicitante: this.audiencia.asistenciaSolicitante,
      asistenciaInvitado: this.audiencia.asistenciaInvitado,
      resultadoTipo: this.resultadoSeleccionado,
      resultadoDetalle: this.subResultado || this.resultadoSeleccionado
    };

    this.http.put(`http://localhost:8080/api/audiencias/${this.audiencia.id}/resultado`, payload, { headers }).subscribe({
      next: () => {
        alert("Sesión registrada correctamente.");

        // Lógica de Redirección según resultado y asistencia
        if (this.resultadoSeleccionado === 'Suspension') {
          this.router.navigate(['/conciliador/suspencion-audiencia', this.audiencia.id]);
        } else if (
          this.resultadoSeleccionado === 'Acuerdo Total' &&
          this.audiencia.asistenciaSolicitante === 'Asistio' &&
          this.audiencia.asistenciaInvitado === 'Asistio'
        ) {
          this.router.navigate(['/conciliador/generar-acta-total', this.audiencia.id]);
        } else if (
          this.resultadoSeleccionado === 'Inasistencias' &&
          this.subResultado === 'Inasistencia de una de las partes'
        ) {
          this.router.navigate(['/conciliador/generacion-acta-inasistencia-una-parte', this.audiencia.id]);
        } else {
          this.router.navigate(['/conciliador/mis-casos']);
        }
      },
      error: (err) => alert("Error al guardar: " + err.message)
    });
  }
}