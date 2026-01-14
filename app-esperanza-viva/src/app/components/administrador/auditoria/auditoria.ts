import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.css']
})
export class Auditoria implements OnInit {
  todosLogs: any[] = [];
  logs: any[] = [];
  usuarioActivo: string = '';

  // Filtros
  filtroUsuario: string = '';
  filtroFecha: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarLogs();
  }

  cargarLogs() {
    this.http.get<any[]>('http://localhost:8080/api/auditoria').subscribe({
      next: (res) => {
        this.todosLogs = res;
        this.filtrarLogs();
      },
      error: (err) => console.error("Error al conectar con la API de auditoría")
    });
  }

  filtrarLogs() {
    const terminoUsuario = this.filtroUsuario.toLowerCase();

    this.logs = this.todosLogs.filter(log => {
      const matchUsuario = log.usuarioNombre?.toLowerCase().includes(terminoUsuario);

      let matchFecha = true;
      if (this.filtroFecha) {
        // Asumiendo formato ISO o compatible en fechaHora
        const fechaLog = new Date(log.fechaHora).toISOString().split('T')[0];
        matchFecha = fechaLog === this.filtroFecha;
      }

      return matchUsuario && matchFecha;
    });
  }

  exportarCSV() {
    const headers = "Fecha,Usuario,Accion,Detalles,Expediente\n";
    const rows = this.logs.map(l =>
      `"${l.fechaHora}","${l.usuarioNombre}","${l.accion}","${l.detalles}","${l.expedienteId || ''}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'auditoria_esperanza_viva.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}