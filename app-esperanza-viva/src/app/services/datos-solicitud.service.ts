import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosSolicitudService {

  datosFormulario: any = {
    solicitante: {},
    invitado: {},
    apoderado: { nombres: '', apellidos: '', domicilio: '' },
    materiaConciliable: '',
    hechos: '',
    pretension: ''
  };

  actualizarDatos(nuevosDatos: any) {
    this.datosFormulario = {
      ...this.datosFormulario,
      ...nuevosDatos
    };
    console.log("Memoria actualizada:", this.datosFormulario);
  }

  obtenerDatos() {
    return this.datosFormulario;
  }
}
