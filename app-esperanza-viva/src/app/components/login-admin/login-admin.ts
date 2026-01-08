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

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ingresar() {
    if (!this.credentials.usuario || !this.credentials.contrasena) {
      alert("Por favor, ingresa tus credenciales.");
      return;
    }

    this.usuarioService.login(this.credentials).subscribe({
      next: (user) => {
        // 1. Guardar sesión (Importante: El rol debe estar en mayúsculas para el Guard)
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        const rolReal = user.rol.toUpperCase();
        console.log("Login exitoso. Rol detectado:", rolReal);

        // 2. Redirección basada en el rol de la BD
        if (rolReal === 'ADMINISTRADOR') {
          this.router.navigate(['/admin-dashboard']);
        } else if (rolReal === 'DIRECTOR') {
          this.router.navigate(['/director/bandeja-solicitudes']);
        } else if (rolReal === 'CONCILIADOR') {
          // 🔹 ESTA ES LA RUTA QUE FALTABA
          this.router.navigate(['/conciliador/mis-casos']);
        } else {
          alert("Rol no reconocido en el sistema.");
          return;
        }
        
        this.cerrar.emit();
      },
      error: (err) => {
        alert("Acceso denegado. Credenciales incorrectas.");
      }
    });
  }

  cancelar() {
    this.cerrar.emit();
  }
}