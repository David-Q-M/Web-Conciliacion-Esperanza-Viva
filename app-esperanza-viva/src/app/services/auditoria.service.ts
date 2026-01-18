import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = 'https://web-conciliacion-esperanza-viva-production.up.railway.app/api/auditoria';

  constructor(private http: HttpClient) {}

  obtenerLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
