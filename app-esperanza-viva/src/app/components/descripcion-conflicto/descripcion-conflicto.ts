import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatosSolicitudService } from '../../services/datos-solicitud.service';

@Component({
  selector: 'app-descripcion-conflicto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './descripcion-conflicto.html',
  styleUrls: ['./descripcion-conflicto.css']
})
export class DescripcionConflicto {
  materia: string = '';
  hechosTexto: string = '';
  pretensionTexto: string = '';

  constructor(
    private router: Router,
    private datosSolicitudService: DatosSolicitudService
  ) {}

  irADocumentos() {
    // 1. Validar selección de materia
    if (!this.materia) {
      alert("Por favor, selecciona una Materia Conciliable.");
      return;
    }

    // 2. Validar longitud mínima de los hechos (Evita textos muy cortos en MariaDB)
    if (this.hechosTexto.trim().length < 20) {
      alert("Por favor, detalla un poco más los hechos (mínimo 20 caracteres).");
      return;
    }

    // 3. Validar pretensión
    if (this.pretensionTexto.trim().length < 10) {
      alert("La pretensión es obligatoria para procesar tu solicitud.");
      return;
    }

    // Si todo es correcto, actualizamos el servicio de memoria
    this.datosSolicitudService.actualizarDatos({
      materiaConciliable: this.materia,
      hechos: this.hechosTexto,
      pretension: this.pretensionTexto
    });
    
    this.router.navigate(['/documentos-adjuntos']);
  }
}