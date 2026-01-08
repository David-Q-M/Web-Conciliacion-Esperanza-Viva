import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Asegúrate de que este puerto coincida con tu backend de Spring Boot
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // 1. Obtener lista de empleados registrados
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Registrar nuevo personal administrativo
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, usuario);
  }

  // 3. Actualizar datos de un empleado existente
  actualizarUsuario(id: number, usuario: any): Observable<any> {
    // 🔹 IMPORTANTE: Verificamos que el ID se pase correctamente en la URL
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  // 4. Eliminar permanentemente a un usuario
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 5. Autenticación de roles (ADMINISTRADOR, DIRECTOR, etc.)
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // 6. Obtener personal por rol (Útil para la pantalla del Director)
  listarPorRol(rol: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rol/${rol}`);
  }
}