import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = 'http://localhost:8080/api/solicitudes';

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
}