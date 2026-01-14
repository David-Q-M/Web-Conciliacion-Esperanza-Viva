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

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ingresar() {
    if (!this.credentials.usuario || !this.credentials.contrasena) {
      alert("Por favor, ingresa tus credenciales.");
      return;
    }

    this.cargando = true;
    this.usuarioService.login(this.credentials).subscribe({
      next: (user) => {
        // 1. Guardar sesión (Importante: El rol debe estar en mayúsculas para el Guard)
        // 1. Guardar sesión
        localStorage.setItem('currentUser', JSON.stringify(user));

        // 🛡️ Soporte para múltiples roles
        const roles = user.roles || (user.rol ? [user.rol] : []);
        const rolesUpper = roles.map((r: string) => r.toUpperCase());

        console.log("Login exitoso. Roles detectados:", rolesUpper);

        // 2. Redirección basada en PREFERENCIA DE USUARIO (Si seleccionó un rol e inició sesión)
        if (this.rolSeleccionado && rolesUpper.includes(this.rolSeleccionado.toUpperCase())) {
          const roleTarget = this.rolSeleccionado.toUpperCase();
          if (roleTarget === 'ADMINISTRADOR') this.router.navigate(['/admin-dashboard']);
          else if (roleTarget === 'DIRECTOR') this.router.navigate(['/director/bandeja-solicitudes']);
          else if (roleTarget === 'CONCILIADOR') this.router.navigate(['/conciliador/mis-casos']);
          else if (roleTarget === 'ABOGADO') this.router.navigate(['/abogado/pendientes']);
          else if (roleTarget === 'NOTIFICADOR') this.router.navigate(['/notificador/pendientes']);

          this.cerrar.emit();
          return;
        }

        // 3. Fallback: Prioridad por defecto si no seleccionó rol o el seleccionado no le corresponde
        if (rolesUpper.includes('ADMINISTRADOR')) {
          this.router.navigate(['/admin-dashboard']);
        } else if (rolesUpper.includes('DIRECTOR')) {
          this.router.navigate(['/director/bandeja-solicitudes']);
        } else if (rolesUpper.includes('CONCILIADOR')) {
          this.router.navigate(['/conciliador/mis-casos']);
        } else if (rolesUpper.includes('ABOGADO')) {
          this.router.navigate(['/abogado/pendientes']);
        } else if (rolesUpper.includes('NOTIFICADOR')) {
          this.router.navigate(['/notificador/pendientes']);
        } else {
          alert("Rol no reconocido en el sistema.");
          return;
        }

        this.cerrar.emit();
      },
      error: (err) => {
        this.cargando = false;
        alert("Acceso denegado. Credenciales incorrectas.");
      }
    });
  }

  cancelar() {
    this.credentials = { usuario: '', contrasena: '' };
    this.cerrar.emit();
  }
}