import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // 🔹 SINCRONIZADO: Debe coincidir exactamente con el @RequestMapping del Backend
  private apiUrl = `${environment.apiUrl}/usuarios-sistema`;

  constructor(private http: HttpClient) { }

  /**
   * 1. Obtener lista de empleados registrados (DNI, Teléfono, etc. incluidos)
   * Vinculado a UsuarioController.listar()
   */
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * 2. Registrar nuevo personal administrativo con campos completos (Wireframe 13)
   * Vinculado a UsuarioController.registrar()
   */
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, usuario);
  }

  /**
   * 3. Actualizar datos de un empleado (incluye nuevos campos profesionales)
   * Vinculado a UsuarioController.actualizar()
   */
  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  /**
   * 4. Eliminar permanentemente a un usuario
   * Vinculado a UsuarioController.eliminar()
   */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * 5. Autenticación de roles (ADMINISTRADOR, DIRECTOR, CONCILIADOR)
   * Vinculado a UsuarioController.login()
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * 6. Obtener personal por rol específico
   * Útil para que el Director elija qué Conciliador asignar (Wireframe 19)
   */
  listarPorRol(rol: string): Observable<any[]> {
    // Convertimos a mayúsculas para asegurar coincidencia con la DB
    const rolUpper = rol.toUpperCase();
    return this.http.get<any[]>(`${this.apiUrl}/rol/${rolUpper}`);
  }

  contarPorRol(rol: string): Observable<number> {
    const rolUpper = rol.toUpperCase();
    return this.http.get<number>(`${this.apiUrl}/count/rol/${rolUpper}`);
  }
}
