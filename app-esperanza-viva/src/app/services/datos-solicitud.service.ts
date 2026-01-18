import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosSolicitudService {

  datosFormulario: any = {
    solicitante: { nombres: '', apellidos: '', dni: '', domicilio: '', telefono: '', correoElectronico: '' },
    invitado: { nombres: '', apellidos: '', dni: '', domicilio: '', telefono: '', correoElectronico: '' },
    apoderado: { nombres: '', apellidos: '', domicilio: '' }, // 
    materiaConciliable: '',
    subMateria: '',
    hechos: '', // [cite: 14]
    pretension: '', // [cite: 17]
    otrasPersonasAlimentario: '' // 🔹 Campo clave para el Punto III del Formato A 
  };

  actualizarDatos(nuevosDatos: any) {
    this.datosFormulario = {
      ...this.datosFormulario,
      ...nuevosDatos
    };
    console.log("Datos listos para el Formato A:", this.datosFormulario);
  }

  obtenerDatos() {
    return this.datosFormulario;
  }
}
