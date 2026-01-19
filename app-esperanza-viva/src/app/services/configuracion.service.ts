import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = 'https://web-conciliacion-esperanza-viva-production.up.railway.app/api/configuracion';

  constructor(private http: HttpClient) { }

  listarPorCategoria(categoria: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  guardarConfiguracion(config: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, config);
  }
}
