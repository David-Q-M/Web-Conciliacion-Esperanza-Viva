import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatosSolicitudService } from '../../../services/datos-solicitud.service';

@Component({
  selector: 'app-descripcion-conflicto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './descripcion-conflicto.html',
  styleUrls: ['./descripcion-conflicto.css']
})
export class DescripcionConflicto {
  // Controles de visibilidad de menús
  menuMateriaAbierto = false;
  menuSubMateriaAbierto = false;
  mostrarCampoAlimentos = false;

  // Datos del formulario
  materiaSeleccionada = '';
  subMateriaSeleccionada = '';
  hechosTexto = '';
  pretensionTexto = '';
  otrasPersonasAlimentario = '';

  constructor(
    private router: Router,
    private datosSolicitudService: DatosSolicitudService
  ) { }

  seleccionarMateria(materia: string) {
    this.materiaSeleccionada = materia;
    this.menuMateriaAbierto = false;
    this.menuSubMateriaAbierto = true; // Salto automático al sub-menú (Wireframe 30)
    this.subMateriaSeleccionada = '';
    this.mostrarCampoAlimentos = false;
  }

  seleccionarSubMateria(sub: string) {
    this.subMateriaSeleccionada = sub;
    this.menuSubMateriaAbierto = false;

    // Wireframe 32: Detectar si es una materia de alimentos
    const materiasAlimentos = [
      'Pensión de Alimentos',
      'Exoneración de Alimentos',
      'Pensión de alimentos a favor de conviviente'
    ];
    this.mostrarCampoAlimentos = materiasAlimentos.includes(sub);
  }

  irADocumentos() {
    if (!this.subMateriaSeleccionada) {
      alert("Por favor, selecciona el tipo de conflicto.");
      return;
    }

    // 1. Validación: Hechos (Min 50, Max 200)
    if (!this.hechosTexto || this.hechosTexto.trim().length < 50) {
      alert(`La descripción de los hechos es muy corta (${this.hechosTexto.length}/50 min). Detalle más los hechos.`);
      return;
    }

    // 2. Validación: Otras Personas (Min 50, Max 200) - Solo si el campo es visible
    if (this.mostrarCampoAlimentos) {
      if (!this.otrasPersonasAlimentario || this.otrasPersonasAlimentario.trim().length < 50) {
        alert(`La descripción de otras personas es muy corta (${(this.otrasPersonasAlimentario || '').length}/50 min).`);
        return;
      }
    }

    // 3. Validación: Pretensión (Min 20, Max 150)
    if (!this.pretensionTexto || this.pretensionTexto.trim().length < 20) {
      alert(`La pretensión es muy corta (${this.pretensionTexto.length}/20 min). Explique mejor qué solicita.`);
      return;
    }

    // Si es materia de alimentos, quizás validar el campo opcional si es necesario, pero es opcional "otrasPersonasAlimentario".

    this.datosSolicitudService.actualizarDatos({
      materiaConciliable: this.materiaSeleccionada,
      subMateria: this.subMateriaSeleccionada,
      hechos: this.hechosTexto,
      pretension: this.pretensionTexto,
      otrasPersonasAlimentario: this.otrasPersonasAlimentario,
    });

    this.router.navigate(['/documentos-adjuntos']);
  }
}
