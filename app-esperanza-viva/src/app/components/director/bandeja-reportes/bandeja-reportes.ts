import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, } from '@angular/router';

@Component({
  selector: 'app-bandeja-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink,],
  templateUrl: './bandeja-reportes.html',
  styleUrls: ['./bandeja-reportes.css']
})
export class BandejaReportes implements OnInit {
  directorNombre: string = '';
  reportData: any = { total: 0, pendientes: 0, revision: 0, aprobadas: 0, lista: [] };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
      next: (res) => {
        this.reportData.lista = res;
        this.reportData.total = res.length;
        this.reportData.pendientes = res.filter(s => s.estado === 'PENDIENTE').length;
        this.reportData.revision = res.filter(s => s.estado === 'ASIGNADO').length;
        this.reportData.aprobadas = res.filter(s => s.estado === 'FINALIZADO').length;
      },
      error: (err) => console.error("Error cargando reportes", err)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}