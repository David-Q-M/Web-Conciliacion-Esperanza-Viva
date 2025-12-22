import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-consulta-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-expediente.html',
  styleUrls: ['./consulta-expediente.css']
})
export class ConsultaExpediente {
  numeroBusqueda: string = '';

  constructor(private router: Router) {}

  consultar() {
    if (this.numeroBusqueda.trim()) {
      // Navegamos a la pantalla de éxito/detalle pasando el número ingresado
      this.router.navigate(['/exito', this.numeroBusqueda.trim()]);
    } else {
      alert("Por favor, ingresa un número de expediente válido.");
    }
  }
}