import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ActaService {
    private apiUrl = `${environment.apiUrl}/actas`;

    constructor(private http: HttpClient) { }

    subirActa(audienciaId: number, tipoActa: string, numeroActa: string, archivo: Blob): Observable<any> {
        const formData = new FormData();
        formData.append('audienciaId', audienciaId.toString());
        formData.append('tipoActa', tipoActa);
        formData.append('numeroActa', numeroActa);
        formData.append('archivo', archivo, 'acta_generada.pdf');

        return this.http.post(`${this.apiUrl}/upload`, formData);
    }

    obtenerPorAudiencia(audienciaId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/audiencia/${audienciaId}`);
    }
}
