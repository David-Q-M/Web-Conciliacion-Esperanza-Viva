import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatosSolicitudService } from '../../../services/datos-solicitud.service';

@Component({
  selector: 'app-registro-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-solicitud.html',
  styleUrls: ['./registro-solicitud.css']
})
export class RegistroSolicitud {

  mostrarApoderado: boolean = false;
  nuevaSolicitud = {
    solicitante: { nombres: '', apellidos: '', dni: '', telefono: '', domicilio: '', correoElectronico: '' },
    apoderado: { nombres: '', apellidos: '', dni: '', telefono: '', domicilio: '', correoElectronico: '' },
    invitado: { nombres: '', apellidos: '', dni: '', telefono: '', domicilio: '', correoElectronico: '' }
  };

  constructor(
    private datosService: DatosSolicitudService,
    private router: Router) { }

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

  // Validación: Caracteres prohibidos en dirección 
  // - Bloquea @, $ (regla anterior)
  // - Bloquea scripts o etiquetas HTML (<, >)
  tieneCaracteresProhibidos(texto: string): boolean {
    const prohibidos = /[@$<>]/; // Bloqueamos @, $, <, >
    const esScript = /<script.*?>.*?<\/script>/ig.test(texto) || /<script/ig.test(texto);
    return prohibidos.test(texto) || esScript;
  }

  irASiguiente() {
    const s = this.nuevaSolicitud.solicitante;
    const i = this.nuevaSolicitud.invitado;
    const a = this.nuevaSolicitud.apoderado; // Alias para apoderado

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
    if (!s.domicilio || s.domicilio.length < 5) {
      alert("El domicilio del solicitante es obligatorio.");
      return;
    }
    if (this.tieneCaracteresProhibidos(s.domicilio)) {
      alert("La dirección contiene caracteres no válidos (@, $, <, >). No se permiten scripts ni caracteres especiales.");
      return;
    }
    if (!this.validarEmail(s.correoElectronico)) {
      alert("El correo electrónico del solicitante no tiene un formato válido.");
      return;
    }

    // --- VALIDACIONES DEL APODERADO (Solo si está habilitado) ---
    if (this.mostrarApoderado) {
      if (!a.nombres || !this.esSoloLetras(a.nombres)) {
        alert("El nombre del apoderado es obligatorio y debe contener solo letras.");
        return;
      }
      if (!a.apellidos || !this.esSoloLetras(a.apellidos)) {
        alert("Los apellidos del apoderado son obligatorios y deben contener solo letras.");
        return;
      }
      if (!a.dni || !this.esSoloNumeros(a.dni) || a.dni.length !== 8) {
        alert("El DNI del apoderado debe tener exactamente 8 números.");
        return;
      }
      if (!a.telefono || !this.esSoloNumeros(a.telefono) || a.telefono.length < 9) {
        alert("Ingresa un número de teléfono válido para el apoderado (mínimo 9 dígitos).");
        return;
      }
      if (!a.domicilio || a.domicilio.length < 5) {
        alert("El domicilio del apoderado es obligatorio.");
        return;
      }
      if (this.tieneCaracteresProhibidos(a.domicilio)) {
        alert("La dirección del apoderado contiene caracteres no válidos (@, $, <, >).");
        return;
      }
      // Validación de email opcional o requerido para apoderado? Asumiremos requerido para consistencia o al menos formato válido si existe.
      // Si queremos que sea obligatorio:
      if (!this.validarEmail(a.correoElectronico)) {
        alert("El correo electrónico del apoderado no tiene un formato válido.");
        return;
      }
    }

    // --- VALIDACIONES DEL INVITADO ---
    if (!i.nombres || !this.esSoloLetras(i.nombres)) {
      alert("El nombre del invitado es obligatorio y debe contener solo letras.");
      return;
    }
    // Apellido invitado puede ser opcional? Generalmente es requerido.
    if (!i.apellidos || !this.esSoloLetras(i.apellidos)) {
      alert("Los apellidos del invitado son obligatorios y deben contener solo letras.");
      return;
    }
    if (!i.dni || !this.esSoloNumeros(i.dni) || i.dni.length !== 8) {
      alert("El DNI del invitado debe tener exactamente 8 números.");
      return;
    }
    // Telefono invitado a veces no se tiene, pero si se pide, validar formato.
    if (i.telefono && (!this.esSoloNumeros(i.telefono) || i.telefono.length < 9)) {
      alert("El teléfono del invitado, si se ingresa, debe ser válido.");
      return;
    }
    if (!i.domicilio || i.domicilio.length < 5) {
      alert("El domicilio del invitado es obligatorio para poder notificarlo.");
      return;
    }
    if (this.tieneCaracteresProhibidos(i.domicilio)) {
      alert("La dirección del invitado contiene caracteres no válidos (@, $, <, >).");
      return;
    }
    if (i.correoElectronico && !this.validarEmail(i.correoElectronico)) {
      alert("El correo del invitado no es válido.");
      return;
    }

    // --- GUARDADO Y NAVEGACIÓN ---
    console.log("Guardando datos completos:", this.nuevaSolicitud);
    // 🔹 Enviamos el objeto completo al servicio de una sola vez
    this.datosService.actualizarDatos(this.nuevaSolicitud);

    this.router.navigate(['/descripcion-conflicto']);
  }
}
