import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginAdmin } from '../login-admin/login-admin';

@Component({
  selector: 'app-consulta-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoginAdmin],
  templateUrl: './consulta-expediente.html',
  styleUrls: ['./consulta-expediente.css']
})
export class ConsultaExpediente {
  numeroBusqueda: string = '';
  mostrarLoginModal = false;
  mostrarMenuRoles: boolean = false;
  rolElegido: string = '';

  constructor(private router: Router) { }

  toggleMenu() {
    this.mostrarMenuRoles = !this.mostrarMenuRoles;
  }

  irALoginAdmin(rol: string) {
    this.rolElegido = rol; // Guardamos si es DIRECTOR, ADMIN, etc.
    this.mostrarMenuRoles = false;
    this.mostrarLoginModal = true;
  }

  consultar() {
    if (this.numeroBusqueda.trim()) {
      this.router.navigate(['/exito-registro', this.numeroBusqueda.trim()]);
    } else {
      alert("Por favor, ingresa un número de expediente válido.");
    }
  }
}