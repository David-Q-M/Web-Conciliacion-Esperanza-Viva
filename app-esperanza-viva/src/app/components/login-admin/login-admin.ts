import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.html',
  styleUrls: ['./login-admin.css']
})
export class LoginAdmin {
  @Input() rolSeleccionado: string = '';
  @Output() cerrar = new EventEmitter<void>();

  credentials = { usuario: '', contrasena: '' };
  cargando = false;
  mensajeError: string | null = null;

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ingresar() {
    this.mensajeError = null;

    // Validación de campos vacíos
    if (!this.credentials.usuario.trim() || !this.credentials.contrasena.trim()) {
      this.mensajeError = "Por favor, complete todos los campos.";
      return;
    }

    this.cargando = true;
    this.usuarioService.login(this.credentials).subscribe({
      next: (user) => {
        // Normalizar roles del usuario desde la BD
        const roles = user.roles || (user.rol ? [user.rol] : []);
        const rolesUpper = roles.map((r: string) => r.toUpperCase());
        const targetRole = this.rolSeleccionado.toUpperCase();

        // VALIDACIÓN DE SEGURIDAD PROFESIONAL: ¿Tiene el rol elegido?
        if (this.rolSeleccionado && !rolesUpper.includes(targetRole)) {
          this.cargando = false;
          this.mensajeError = `Acceso denegado: Usted no cuenta con el perfil de ${this.rolSeleccionado}.`;
          return;
        }

        // Guardar sesión y token para Railway
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.token) localStorage.setItem('token', user.token);

        // Redirección exitosa
        this.ejecutarRedireccion(targetRole || rolesUpper[0]);
        this.cerrar.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = "Usuario o contraseña incorrectos.";
        console.error("Error de login:", err);
      }
    });
  }

  private ejecutarRedireccion(role: string) {
    const rutas: { [key: string]: string } = {
      'ADMINISTRADOR': '/admin-dashboard',
      'DIRECTOR': '/director/bandeja-solicitudes',
      'CONCILIADOR': '/conciliador/mis-casos',
      'ABOGADO': '/abogado/pendientes',
      'NOTIFICADOR': '/notificador/pendientes',
      'SECRETARIO': '/secretario/reporte'
    };
    this.router.navigate([rutas[role] || '/consulta']);
  }

  cancelar() {
    this.credentials = { usuario: '', contrasena: '' };
    this.mensajeError = null;
    this.cerrar.emit();
  }
}