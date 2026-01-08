import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) { }

  // 🔹 Obtener todas las solicitudes para las métricas del Dashboard y Listados
  listarSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Registrar nueva solicitud (Wireframes 2 y 3)
  registrarSolicitud(formData: FormData): Observable<any> {
    // El backend espera POST a /api/solicitudes
    return this.http.post(this.apiUrl, formData);
  }

  // Buscar por número de expediente
  buscarPorExpediente(numero: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar/${numero}`);
  }

  obtenerExpediente(numero: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar/${numero}`);
  }

  // 🔹 NUEVO: Obtener detalle por ID (Para ver detalles en paneles)
  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // 🔹 NUEVO: Actualizar estado (Para Aprobar/Rechazar/Observar)
  actualizarEstado(id: number, estado: string, observacion: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado, observacion });
  }

  // 🔹 NUEVO: Designar Conciliador (Para el Director)
  designarConciliador(id: number, conciliadorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/designar`, { conciliadorId });
  }

  // 🔹 NUEVO: Obtener solicitudes de un conciliador especifico
  listarPorConciliador(conciliadorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conciliador/${conciliadorId}`);
  }
}