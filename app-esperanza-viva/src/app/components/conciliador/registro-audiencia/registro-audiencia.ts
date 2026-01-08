import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-audiencia.html',
  styleUrls: ['./registro-audiencia.css']
})
export class RegistroAudiencia implements OnInit {
  audiencia: any = {};
  solicitudId: any;
  conciliadorNombre: string = '';

  resultadoSeleccionado: string = '';
  subResultado: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 🛡️ Validación de sesión para evitar redirecciones forzadas
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    this.solicitudId = this.route.snapshot.paramMap.get('id');
    if (this.solicitudId) {
      this.cargarDatosAudiencia();
    }
  }

  cargarDatosAudiencia() {
    this.http.get(`http://localhost:8080/api/audiencias/solicitud/${this.solicitudId}`).subscribe({
      next: (res) => this.audiencia = res,
      error: (err) => console.error("Error al cargar la audiencia", err)
    });
  }

  toggleAsistencia(parte: 'solicitante' | 'invitado') {
    if (parte === 'solicitante') {
      this.audiencia.asistenciaSolicitante = !this.audiencia.asistenciaSolicitante;
    } else {
      this.audiencia.asistenciaInvitado = !this.audiencia.asistenciaInvitado;
    }
  }

  finalizarProceso() {
    // 🛡️ Validación: Si se seleccionó una opción que requiere detalle, este no puede estar vacío
    if ((this.resultadoSeleccionado === 'Inasistencias' || this.resultadoSeleccionado === 'Falta de Acuerdo')
      && !this.subResultado) {
      alert("Por favor, seleccione el detalle para el resultado: " + this.resultadoSeleccionado);
      return;
    }

    const payload = {
      ...this.audiencia,
      resultadoTipo: this.resultadoSeleccionado,
      resultadoDetalle: this.subResultado
    };

    this.http.put(`http://localhost:8080/api/audiencias/${this.audiencia.id}/resultado`, payload).subscribe({
      next: () => {
        alert("Resultado registrado exitosamente.");
        if (this.resultadoSeleccionado === 'Acuerdo Total') {
          this.router.navigate(['/conciliador/generar-acta', this.solicitudId]);
        } else {
          this.router.navigate(['/conciliador/mis-casos']);
        }
      },
      error: (err) => alert("Error al guardar: " + err.message)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}