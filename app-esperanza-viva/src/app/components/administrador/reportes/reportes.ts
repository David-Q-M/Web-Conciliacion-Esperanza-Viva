import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes implements OnInit {
  usuarioActivo: string = '';
  data: any = { 
    totalSolicitudes: 0, 
    tasaFinalizacion: 0, 
    personalActivo: 0, 
    pendientes: 0, 
    asignados: 0, 
    finalizadosContador: 0 
  };
  
  listaPersonalCarga: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarDatosReales();
  }

  cargarDatosReales() {
    // 1. Obtener contadores por estado y globales
    this.http.get('http://localhost:8080/api/reportes/estadisticas').subscribe({
      next: (res: any) => this.data = res,
      error: (err) => console.error("Error cargando estadísticas de MariaDB", err)
    });

    // 2. Obtener lista de personal operativa real
    this.http.get<any[]>('http://localhost:8080/api/usuarios').subscribe({
      next: (res) => {
        this.listaPersonalCarga = res.filter(u => u.rol !== 'ADMINISTRADOR');
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}