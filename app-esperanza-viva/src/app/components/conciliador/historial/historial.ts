import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './historial.html',
  styleUrls: ['./historial.css']
})
export class Historial implements OnInit {
  casosCerrados: any[] = [];
  conciliadorNombre: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
      next: (res) => {
        // Filtramos solo casos que ya terminaron
        this.casosCerrados = res.filter(s => s.estado === 'Finalizado' || s.estado === 'Cerrado');
      },
      error: (err) => console.error("Error al cargar historial", err)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}