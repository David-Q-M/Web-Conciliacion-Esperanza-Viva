import { Component, Output, EventEmitter } from '@angular/core';
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
    @Output() cerrar = new EventEmitter<void>();
    credentials = { usuario: '', contrasena: '' };

    constructor(private usuarioService: UsuarioService, private router: Router) {}

    ingresar() {
        this.usuarioService.login(this.credentials).subscribe({
        next: (user) => {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.router.navigate(['/gestion-usuarios']);
        },
        error: (err) => alert("Usuario o contraseña incorrectos")
        });
    }

    cancelar() {
        this.cerrar.emit();
        this.router.navigate(['/']); // Regresa a la pantalla principal
    }
}