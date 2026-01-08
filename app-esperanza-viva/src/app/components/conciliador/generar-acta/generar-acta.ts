import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generar-acta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './generar-acta.html',
  styleUrls: ['./generar-acta.css']
})
export class GenerarActa implements OnInit {
  solicitudId: any;
  expediente: any = {};
  abogados: any[] = [];
  conciliadorNombre: string = '';

  acta = {
    antecedentes: '',
    controversias: '',
    abogadoVerificadorId: null,
    clausulas: [{ orden: 1, descripcion: '' }]
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
      this.cargarDatos();
      this.cargarAbogados();
    }
  }

  cargarDatos() {
    this.http.get<any>(`http://localhost:8080/api/solicitudes/${this.solicitudId}`).subscribe({
      next: (res) => {
        this.expediente = res;
        this.acta.antecedentes = res.hechos || '';
      },
      error: (err) => console.error("Error al obtener datos del expediente", err)
    });
  }

  cargarAbogados() {
    // 🔹 Filtramos por el rol ABOGADO definido en tu usuarios_sistema
    this.http.get<any[]>('http://localhost:8080/api/usuarios-sistema').subscribe({
      next: (res) => {
        this.abogados = res.filter(u => u.rol === 'ABOGADO' && u.estado === 'ACTIVO');
      },
      error: (err) => console.error("Error al cargar abogados", err)
    });
  }

  agregarClausula() {
    const nuevoOrden = this.acta.clausulas.length + 1;
    this.acta.clausulas.push({ orden: nuevoOrden, descripcion: '' });
  }

  emitirActaFinal() {
    if (!this.acta.antecedentes || this.acta.antecedentes.trim().length < 10) {
      alert("Los antecedentes son obligatorios y deben ser detallados.");
      return;
    }

    if (!this.acta.controversias || this.acta.controversias.trim().length < 10) {
      alert("La descripción de las controversias es obligatoria.");
      return;
    }

    // Validar clausulas: al menos una y q tenga descripcion
    const clausulasValidas = this.acta.clausulas.filter(c => c.descripcion && c.descripcion.trim().length > 5);
    if (clausulasValidas.length === 0) {
      alert("Debe agregar al menos una cláusula válida (acuerdo) al acta.");
      return;
    }

    if (!this.acta.abogadoVerificadorId) {
      alert("Es obligatorio seleccionar un abogado verificador.");
      return;
    }

    this.http.post(`http://localhost:8080/api/audiencias/finalizar`, {
      solicitudId: this.solicitudId,
      ...this.acta
    }).subscribe({
      next: () => {
        alert("¡Acta Final Emitida con éxito!");
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => alert("Error al emitir el acta: " + err.message)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}