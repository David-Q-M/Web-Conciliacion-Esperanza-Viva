import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Importamos el componente de login para poder usarlo como etiqueta
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
  mostrarLoginModal = false; // Controla el modal sobrepuesto
  mostrarMenuRoles: boolean = false; 

  constructor(private router: Router) {}

  toggleMenu() {
    this.mostrarMenuRoles = !this.mostrarMenuRoles;
  }

  // Activa el modal sobrepuesto sin cambiar de URL 
  irALoginAdmin(rol: string) {
    console.log("Rol seleccionado:", rol);
    this.mostrarMenuRoles = false;
    this.mostrarLoginModal = true; 
  }

  consultar() {
    if (this.numeroBusqueda.trim()) {
      this.router.navigate(['/exito', this.numeroBusqueda.trim()]);
    } else {
      alert("Por favor, ingresa un número de expediente válido.");
    }
  }
}