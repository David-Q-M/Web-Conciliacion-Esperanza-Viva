import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.css']
})
export class GestionUsuarios implements OnInit {
  usuarios: any[] = [];
  mostrarModal = false;
  modoEdicion = false;
  usuarioActivo: string = '';

  usuarioForm: any = {
    id: null,
    nombreCompleto: '',
    usuario: '',
    contrasena: '',
    rol: 'DIRECTOR',
    nroRegistro: '',
    nroColegiatura: '',
    nroEspecializacion: ''
  };

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usuarioActivo = user.nombreCompleto || 'Administrador';
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => this.usuarios = res,
      error: (err) => console.error("Error cargando personal", err)
    });
  }

  abrirRegistro() {
    this.modoEdicion = false;
    this.resetForm();
    this.mostrarModal = true;
  }

  abrirEdicion(u: any) {
    this.modoEdicion = true;
    this.usuarioForm = { ...u }; // 🔹 Clonación profunda para edición segura
    this.mostrarModal = true;
  }

  resetForm() {
    this.usuarioForm = {
      id: null, nombreCompleto: '', usuario: '', contrasena: '',
      rol: 'DIRECTOR', nroRegistro: '', nroColegiatura: '', nroEspecializacion: ''
    };
  }

  guardar() {
    // 🛡️ Validación: Usuario y contraseña mínimos
    if (!this.usuarioForm.usuario || this.usuarioForm.usuario.length < 5) {
      alert("El nombre de usuario debe tener al menos 5 caracteres.");
      return;
    }
    // La contraseña es obligatoria al registrar, pero opcional al editar (si no se quiere cambiar)
    if (!this.modoEdicion && (!this.usuarioForm.contrasena || this.usuarioForm.contrasena.length < 5)) {
      alert("La contraseña debe tener al menos 5 caracteres.");
      return;
    }
    // Si estamos editando y escribieron algo en la contraseña, validamos longitud
    if (this.modoEdicion && this.usuarioForm.contrasena && this.usuarioForm.contrasena.length < 5) {
      alert("La nueva contraseña debe tener al menos 5 caracteres.");
      return;
    }

    const peticion = this.modoEdicion
      ? this.usuarioService.actualizarUsuario(this.usuarioForm.id, this.usuarioForm)
      : this.usuarioService.registrarUsuario(this.usuarioForm);

    peticion.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarUsuarios();
        alert(this.modoEdicion ? "Datos actualizados exitosamente" : "Personal registrado con éxito");
      },
      error: (err) => alert("Error: " + err.message)
    });
  }

  eliminarUsuario(id: number, nombre: string) {
    if (confirm(`¿Está seguro de eliminar permanentemente a ${nombre}?`)) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}