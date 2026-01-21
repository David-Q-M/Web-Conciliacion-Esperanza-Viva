import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) { }

  registrarSolicitud(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  listarSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  obtenerExpediente(numero: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar/${numero}`);
  }

  obtenerCargaLaboral(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/carga-laboral`);
  }

  buscarPorNumero(numero: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/buscar/${numero}`);
  }

  // 🔹 NUEVO: Actualizar estado (Aprobar/Observar)
  actualizarEstado(id: number, estado: string, observacion: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { estado, observacion });
  }

  // 🔹 NUEVO: Designar Conciliador (Director)
  designarConciliador(id: number, conciliadorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/designar`, { conciliadorId });
  }

  // 🔹 NUEVO: Listar por conciliador (Conciliador)
  listarPorConciliador(conciliadorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conciliador/${conciliadorId}`);
  }

  // 🔹 NUEVO: Listar por estado (Director solo PENDIENTES)
  listarPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // 🔹 NUEVO: Listar por conciliador y estado (Conciliador solo ASIGNADOS)
  listarPorConciliadorYEstado(id: number, estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conciliador/${id}/estado/${estado}`);
  }

  // 🔹 NUEVO: Descargar archivo seguro (Blob)
  descargarArchivo(id: number, tipo: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/archivo/${tipo}`, { responseType: 'blob' });
  }
}
