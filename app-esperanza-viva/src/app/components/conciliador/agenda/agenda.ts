import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css']
})
export class AgendaConciliador implements OnInit {
  audiencias: any[] = [];
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
    this.cargarAgenda();
  }

  cargarAgenda() {
    // 🔹 Endpoint que trae las audiencias programadas
    this.http.get<any[]>('http://localhost:8080/api/audiencias').subscribe({
      next: (res) => {
        // Ordenar por fecha y hora más cercana
        this.audiencias = res.sort((a, b) => 
          new Date(a.fechaAudiencia).getTime() - new Date(b.fechaAudiencia).getTime()
        );
      },
      error: (err) => console.error("Error al cargar agenda", err)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login-admin']);
  }
}