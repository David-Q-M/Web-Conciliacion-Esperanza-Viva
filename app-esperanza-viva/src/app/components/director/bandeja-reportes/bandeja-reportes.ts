import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bandeja-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './bandeja-reportes.html',
  styleUrls: ['./bandeja-reportes.css']
})
export class BandejaReportes implements OnInit {
  directorNombre: string = '';
  // listaOriginal mantiene el backup de la DB, lista es lo que se ve en la tabla
  reportData: any = { total: 0, pendientes: 0, revision: 0, aprobadas: 0, lista: [], listaOriginal: [] };
  filtroActual: string = 'TOTAL';
  terminoBusqueda: string = '';
  isLoading: boolean = true;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/solicitudes', { headers }).subscribe({
      next: (res) => {
        this.reportData.listaOriginal = res;
        this.reportData.lista = res;

        // Cálculo dinámico de métricas para los cuadros
        this.reportData.total = res.length;
        this.reportData.pendientes = res.filter(s => s.estado === 'PENDIENTE').length;
        this.reportData.revision = res.filter(s => s.estado === 'ASIGNADO' || s.estado === 'OBSERVADO').length;
        this.reportData.aprobadas = res.filter(s => s.estado === 'APROBADO' || s.estado === 'FINALIZADO').length;
        setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error al conectar con la API de reportes", err);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🖱️ FILTRO POR CLIC EN CUADROS
   */
  filtrarPorEstado(criterio: string) {
    this.filtroActual = criterio;
    if (criterio === 'TOTAL') {
      this.reportData.lista = this.reportData.listaOriginal;
    } else if (criterio === 'PENDIENTE') {
      this.reportData.lista = this.reportData.listaOriginal.filter((s: any) => s.estado === 'PENDIENTE');
    } else if (criterio === 'REVISION') {
      this.reportData.lista = this.reportData.listaOriginal.filter((s: any) => s.estado === 'ASIGNADO' || s.estado === 'OBSERVADO');
    } else if (criterio === 'APROBADA') {
      this.reportData.lista = this.reportData.listaOriginal.filter((s: any) => s.estado === 'APROBADO' || s.estado === 'FINALIZADO');
    }
  }

  // 🔍 Buscador manual por texto
  buscar() {
    const busq = this.terminoBusqueda.toLowerCase();
    this.reportData.lista = this.reportData.listaOriginal.filter((s: any) =>
      s.numeroExpediente?.toLowerCase().includes(busq) ||
      s.solicitante?.nombres?.toLowerCase().includes(busq) ||
      s.materiaConciliable?.toLowerCase().includes(busq)
    );
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}