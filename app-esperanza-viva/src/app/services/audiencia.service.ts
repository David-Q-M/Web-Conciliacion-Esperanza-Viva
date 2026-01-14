import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudienciaService {
  private url = 'http://localhost:8080/api/audiencias';

  constructor(private http: HttpClient) {}

  // 🛡️ Genera las cabeceras con el token para evitar el Error 403
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  programar(datos: any): Observable<any> {
    return this.http.post(`${this.url}/programar`, datos, { headers: this.getHeaders() });
  }

  // 🆕 Necesario para listar las audiencias del conciliador logueado
  listarPorConciliador(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/conciliador/${id}`, { headers: this.getHeaders() });
  }

  obtenerPorSolicitud(id: number): Observable<any> {
    return this.http.get(`${this.url}/solicitud/${id}`, { headers: this.getHeaders() });
  }

  registrarResultado(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.url}/${id}/resultado`, datos, { headers: this.getHeaders() });
  }
}