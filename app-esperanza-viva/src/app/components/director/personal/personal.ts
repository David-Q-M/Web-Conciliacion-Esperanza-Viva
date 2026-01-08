import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // 🔹 REINCORPORADOS

@Component({
  selector: 'app-gestion-personal-director',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // 🔹 AHORA SÍ SE USAN EN EL HTML
  templateUrl: './personal.html',
  styleUrls: ['./personal.css']
})
export class GestionPersonal implements OnInit {
  personal: any[] = [];
  stats = { total: 0, activos: 0, conciliadores: 0, abogados: 0 };
  directorNombre: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.directorNombre = user.nombreCompleto || 'Director';
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.http.get<any[]>('http://localhost:8080/api/usuarios').subscribe({
      next: (res) => {
        // Filtramos para no mostrar administradores en la supervisión del director
        this.personal = res.filter(u => u.rol !== 'ADMINISTRADOR');
        this.stats.total = this.personal.length;
        this.stats.activos = this.personal.filter(u => u.estado === 'ACTIVO').length;
        this.stats.conciliadores = this.personal.filter(u => u.rol === 'CONCILIADOR').length;
        this.stats.abogados = this.personal.filter(u => u.rol === 'ABOGADO').length;
      },
      error: (err) => console.error("Error al conectar con la base de datos", err)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}