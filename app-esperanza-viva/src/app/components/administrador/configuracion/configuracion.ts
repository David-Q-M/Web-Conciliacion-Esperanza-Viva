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
  horario: string = '09:00 - 17:00';
  usuarioActivo: string = ''; // 🔹 Para el admin-badge

  constructor(
    private configService: ConfiguracionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
    this.cargarDatosSistema();
  }

  cargarDatosSistema() {
    this.configService.listarPorCategoria('ESTADO').subscribe(res => this.estados = res);
    this.configService.listarPorCategoria('MATERIA').subscribe(res => this.materias = res);
    this.configService.listarPorCategoria('RECHAZO').subscribe(res => this.rechazos = res);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}