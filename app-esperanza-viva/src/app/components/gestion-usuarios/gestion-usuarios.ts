import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.css']
})
export class GestionUsuarios implements OnInit {
  usuarios: any[] = [];
  mostrarModal = false;
  modoEdicion = false;
  usuarioActivo: string = '';
  usuarioForm: any = { id: null, nombreCompleto: '', usuario: '', contrasena: '', rol: 'CONCILIADOR' };

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe(res => this.usuarios = res);
  }

  abrirRegistro() {
    this.modoEdicion = false;
    this.usuarioForm = { id: null, nombreCompleto: '', usuario: '', contrasena: '', rol: 'CONCILIADOR' };
    this.mostrarModal = true;
  }

  abrirEdicion(u: any) {
    this.modoEdicion = true;
    this.usuarioForm = { ...u };
    this.mostrarModal = true;
  }

  guardar() {
    if (this.modoEdicion) {
      this.usuarioService.actualizarUsuario(this.usuarioForm.id, this.usuarioForm).subscribe(() => {
        this.mostrarModal = false;
        this.cargarUsuarios();
      });
    } else {
      this.usuarioService.registrarUsuario(this.usuarioForm).subscribe(() => {
        this.mostrarModal = false;
        this.cargarUsuarios();
      });
    }
  }

  eliminarUsuario(id: number, nombre: string) {
    if (confirm(`¿Eliminar a ${nombre}?`)) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}