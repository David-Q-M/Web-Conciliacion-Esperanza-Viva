import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../../services/solicitud.service';
import * as XLSX from 'xlsx';

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

  errorMessage: string = '';

  constructor(private solicitudService: SolicitudService, private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.isLoading = true;
    this.errorMessage = '';
    this.solicitudService.listarSolicitudes().subscribe({
      next: (res) => {
        console.log("🔍 REPORTES - DATOS RECIBIDOS:", res);
        this.reportData.listaOriginal = res;
        this.reportData.lista = res;

        // Cálculo dinámico de métricas para los cuadros
        this.reportData.total = res.length;
        this.reportData.pendientes = res.filter((s: any) => s.estado === 'PENDIENTE').length;
        this.reportData.revision = res.filter((s: any) => s.estado === 'ASIGNADO' || s.estado === 'OBSERVADO').length;
        this.reportData.aprobadas = res.filter((s: any) => s.estado === 'APROBADO' || s.estado === 'FINALIZADO').length;
        setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error al conectar con la API de reportes", err);
        this.errorMessage = 'No se pudieron cargar los reportes. Verifique su conexión.';
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

  exportarIndividual(item: any) {
    const data = [{
      'N° Expediente': item.numeroExpediente,
      'Fecha': item.fechaPresentacion,
      'Estado': item.estado,
      'Solicitante': item.solicitanteNombre,
      'DNI Solicitante': item.solicitanteDni,
      'Apoderado/Representante': item.apoderadoNombre ? `${item.apoderadoNombre} (DNI: ${item.apoderadoDni})` : '—',
      'Invitado': item.invitadoNombre,
      'DNI Invitado': item.invitadoDni,
      'Materia': item.materiaConciliable,
      'Conciliador': item.conciliadorNombre
    }];

    this.generarExcel(data, `Reporte_Exp_${item.numeroExpediente}`);
  }

  exportarGlobal() {
    const data = this.reportData.lista.map((item: any) => ({
      'N° Expediente': item.numeroExpediente,
      'Fecha': item.fechaPresentacion,
      'Estado': item.estado,
      'Solicitante': item.solicitanteNombre,
      'DNI Solicitante': item.solicitanteDni,
      'Apoderado/Representante': item.apoderadoNombre ? `${item.apoderadoNombre} (DNI: ${item.apoderadoDni})` : '—',
      'Invitado': item.invitadoNombre,
      'DNI Invitado': item.invitadoDni,
      'Materia': item.materiaConciliable,
      'Conciliador': item.conciliadorNombre
    }));

    this.generarExcel(data, `Reporte_Global_${new Date().toISOString().slice(0, 10)}`);
  }

  private generarExcel(data: any[], fileName: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}