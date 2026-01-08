import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-programar-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './programar-audiencia.html',
  styleUrls: ['./programar-audiencia.css']
})
export class ProgramarAudiencia implements OnInit {
  solicitudId: any;
  expediente: any = {};
  conciliadorNombre: string = '';

  form = {
    fechaAudiencia: '',
    horaAudiencia: '',
    lugar: 'Centro de Conciliación Esperanza Viva'
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 🛡️ Validación de sesión para evitar que el Guard te bote
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    this.solicitudId = this.route.snapshot.paramMap.get('id');
    if (this.solicitudId) {
      this.cargarDatosExpediente();
    }
  }

  cargarDatosExpediente() {
    this.http.get(`http://localhost:8080/api/solicitudes/${this.solicitudId}`).subscribe({
      next: (res) => this.expediente = res,
      error: (err) => console.error("Error al cargar datos para Formato C", err)
    });
  }

  generarInvitacion() {
    if (!this.form.fechaAudiencia || !this.form.horaAudiencia) {
      alert("Por favor, complete la fecha y hora de la audiencia.");
      return;
    }

    // 🛡️ Validación: Fecha no puede ser pasada
    const fechaSeleccionada = new Date(this.form.fechaAudiencia + 'T00:00:00'); // Compensar horario local
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Comparar solo fechas sin hora

    if (fechaSeleccionada < hoy) {
      alert("La fecha de la audiencia no puede ser anterior a la fecha actual.");
      return;
    }

    const payload = {
      solicitud: { id: this.solicitudId },
      ...this.form
    };

    this.http.post('http://localhost:8080/api/audiencias/programar', payload).subscribe({
      next: () => {
        alert("Formato C Generado exitosamente. Se ha notificado a las partes.");
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => alert("Error al programar: " + err.message)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}