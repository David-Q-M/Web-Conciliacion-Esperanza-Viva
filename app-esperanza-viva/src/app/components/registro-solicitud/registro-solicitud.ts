import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatosSolicitudService } from '../../services/datos-solicitud.service';

@Component({
  selector: 'app-registro-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-solicitud.html',
  styleUrls: ['./registro-solicitud.css']
})
export class RegistroSolicitud {
  nuevaSolicitud = {
    solicitante: { nombres: '', apellidos: '', dni: '', telefono: '', domicilio: '', correoElectronico: '' },
    invitado: { nombres: '', apellidos: '', dni: '', telefono: '', domicilio: '', correoElectronico: '' }
  };

  constructor(
    private datosService: DatosSolicitudService,
    private router: Router) {}

  // Validación: Solo números
  esSoloNumeros(valor: string): boolean {
    return /^\d+$/.test(valor);
  }

  // Validación: Solo letras
  esSoloLetras(valor: string): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
  }

  // Validación: Formato Email
  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  irASiguiente() {
    const s = this.nuevaSolicitud.solicitante;
    const i = this.nuevaSolicitud.invitado;

    // --- VALIDACIONES DEL SOLICITANTE ---
    if (!s.nombres || !this.esSoloLetras(s.nombres)) {
      alert("El nombre del solicitante es obligatorio y debe contener solo letras.");
      return;
    }
    if (!s.apellidos || !this.esSoloLetras(s.apellidos)) {
      alert("Los apellidos del solicitante son obligatorios y deben contener solo letras.");
      return;
    }
    if (!s.dni || !this.esSoloNumeros(s.dni) || s.dni.length !== 8) {
      alert("El DNI del solicitante debe tener exactamente 8 números.");
      return;
    }
    if (!s.telefono || !this.esSoloNumeros(s.telefono) || s.telefono.length < 9) {
      alert("Ingresa un número de teléfono válido para el solicitante (mínimo 9 dígitos).");
      return;
    }
    if (!this.validarEmail(s.correoElectronico)) {
      alert("El correo electrónico del solicitante no tiene un formato válido.");
      return;
    }

    // --- VALIDACIONES DEL INVITADO ---
    if (!i.nombres || !this.esSoloLetras(i.nombres)) {
      alert("El nombre del invitado es obligatorio y debe contener solo letras.");
      return;
    }
    if (!i.dni || !this.esSoloNumeros(i.dni) || i.dni.length !== 8) {
      alert("El DNI del invitado debe tener exactamente 8 números.");
      return;
    }
    if (i.correoElectronico && !this.validarEmail(i.correoElectronico)) {
      alert("El correo del invitado no es válido.");
      return;
    }

    // --- GUARDADO Y NAVEGACIÓN ---
    console.log("Datos validados correctamente. Guardando en memoria...");
    this.datosService.actualizarDatos({
      solicitante: this.nuevaSolicitud.solicitante,
      invitado: this.nuevaSolicitud.invitado
    });
    
    this.router.navigate(['/descripcion-conflicto']);
  }
}