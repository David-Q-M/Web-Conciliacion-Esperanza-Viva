import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfiguracionService } from '../../../services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class Configuracion implements OnInit {
  estados: any[] = [];
  materias: any[] = [];
  rechazos: any[] = [];

  usuarioActivo: string = '';

  // Configuración de Documentos (Headers)
  headers: any = {
    direccion: 'Av. Esperanza 123, Oficina 404',
    telefono: '(01) 555-1234',
    resolucion: 'Resolución Directoral N° 001-2024-MINJUS',
    piePagina: 'Comprometidos con la paz social.'
  };

  // Inputs para nuevos registros
  nuevoEstado: string = '';
  nuevaMateria: string = '';

  constructor(
    private configService: ConfiguracionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';

    this.cargarDatosSistema();
    this.cargarHeadersLocales();
  }

  cargarDatosSistema() {
    this.configService.listarPorCategoria('ESTADO').subscribe(res => this.estados = res);
    this.configService.listarPorCategoria('MATERIA').subscribe(res => this.materias = res);
    this.configService.listarPorCategoria('RECHAZO').subscribe(res => this.rechazos = res);
  }

  cargarHeadersLocales() {
    const stored = localStorage.getItem('config_headers');
    if (stored) {
      this.headers = JSON.parse(stored);
    }
  }

  guardarHeaders() {
    localStorage.setItem('config_headers', JSON.stringify(this.headers));
    alert("✅ Encabezados y datos institucionales actualizados correctamente.");
  }

  agregarItem(categoria: string, valor: string) {
    if (!valor.trim()) return;

    const item = { categoria, valor: valor.toUpperCase(), descripcion: valor };
    this.configService.guardarConfiguracion(item).subscribe({
      next: () => {
        alert("Agregado exitosamente");
        this.cargarDatosSistema();
        if (categoria === 'ESTADO') this.nuevoEstado = '';
        if (categoria === 'MATERIA') this.nuevaMateria = '';
      },
      error: (err) => alert("Error al guardar")
    });
  }

  subirFirma() {
    alert("Funcionalidad de carga de imagen simulada. La firma se actualizaría en el servidor.");
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}
