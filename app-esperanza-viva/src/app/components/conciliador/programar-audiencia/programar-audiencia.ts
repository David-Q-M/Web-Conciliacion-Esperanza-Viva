import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    lugar: 'Av. Sol 450 - Cusco (Sede Principal)'
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
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

    this.solicitudId = this.route.snapshot.paramMap.get('id');
    if (this.solicitudId) {
      this.cargarDatosExpediente();
    }
  }

  cargarDatosExpediente() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://localhost:8080/api/solicitudes/${this.solicitudId}`, { headers }).subscribe({
      next: (res) => this.expediente = res,
      error: (err) => console.error("Error al cargar datos de MariaDB", err)
    });
  }

  // 🛡️ Validación compartida para ambos botones
  validarFormulario(): boolean {
    if (!this.form.fechaAudiencia || !this.form.horaAudiencia) {
      alert("Por favor, seleccione una fecha y hora mediante el desplegable.");
      return false;
    }
    const fechaSeleccionada = new Date(this.form.fechaAudiencia + 'T' + this.form.horaAudiencia);
    if (fechaSeleccionada < new Date()) {
      alert("⚠️ Error: No se puede programar una audiencia para una fecha u hora que ya pasó.");
      return false;
    }
    return true;
  }

  generarInvitacion() {
    if (!this.validarFormulario()) return;
    alert("Generando Formato C (Invitación)... El documento se descargará en breve.");
    // Aquí iría tu lógica de descarga de PDF
  }

  // 🆕 FUNCIÓN PARA GUARDAR Y VOLVER AL PANEL
  guardarYSalir() {
    if (!this.validarFormulario()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      solicitud: { id: this.solicitudId },
      ...this.form
    };

    this.http.post('http://localhost:8080/api/audiencias/programar', payload, { headers }).subscribe({
      next: () => {
        alert("¡Audiencia Guardada! Se ha actualizado el calendario del sistema.");
        this.router.navigate(['/conciliador/mis-casos']); // Retorno al panel
      },
      error: (err) => alert("Error al guardar: " + err.message)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}