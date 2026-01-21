import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) { }

  listarPorCategoria(categoria: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  guardarConfiguracion(config: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, config);
  }
}
