import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  // La URL de tu Backend en Spring Boot
  private apiUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) { }

  // Envía los datos de los Wireframes 2 y 3 al Backend
  registrarSolicitud(formData: FormData): Observable<any> {
    // Al enviar archivos, NO se debe especificar Content-Type manualmente, 
    // el navegador lo hará automáticamente como multipart/form-data.
    return this.http.post(this.apiUrl, formData);
  }

  // Añade esta función dentro de tu SolicitudService
    buscarPorExpediente(numero: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/buscar/${numero}`);
    }
    
    obtenerExpediente(numero: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/buscar/${numero}`);
    }

    registrarSolicitudCompleta(formData: FormData): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/completa`, formData);
    }
}