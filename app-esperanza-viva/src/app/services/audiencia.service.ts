import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudienciaService {
  private url = 'http://localhost:8080/api/audiencias';

  constructor(private http: HttpClient) {}

  programar(datos: any): Observable<any> {
    return this.http.post(`${this.url}/programar`, datos);
  }

  obtenerPorSolicitud(id: number): Observable<any> {
    return this.http.get(`${this.url}/solicitud/${id}`);
  }

  registrarResultado(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.url}/${id}/resultado`, datos);
  }
}