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

  listaRoles = ['ADMINISTRADOR', 'DIRECTOR', 'CONCILIADOR', 'ABOGADO', 'NOTIFICADOR'];

  usuarioForm: any = {
    id: null,
    nombreCompleto: '',
    dni: '',
    telefono: '',
    direccion: '',
    correoElectronico: '',
    usuario: '',
    contrasena: '',
    roles: [], // 🔹 CAMBIO: Array de roles
    nroRegistro: '',
    nroColegiatura: '',
    nroEspecializacion: '',
    estado: 'ACTIVO'
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
      error: (err) => console.error("Error al cargar personal", err)
    });
  }

  // 🛡️ Validación estricta: DNI 8 dígitos, Celular 9 dígitos (empieza con 9)
  esFormularioValido(): boolean {
    const f = this.usuarioForm;
    const regexCelular = /^9[0-9]{8}$/;
    const regexDNI = /^[0-9]{8}$/;

    const basico = f.nombreCompleto.length > 5 &&
      regexDNI.test(f.dni) &&
      regexCelular.test(f.telefono) &&
      f.usuario.length >= 4;

    const seguridad = this.modoEdicion ? true : (f.contrasena && f.contrasena.length >= 6);

    let credencial = true;
    const roles = f.roles || [];

    if (roles.includes('CONCILIADOR')) credencial = !!(f.nroRegistro?.length > 2);
    if (roles.includes('ABOGADO')) credencial = !!(f.nroColegiatura?.length > 2);

    return !!(basico && seguridad && credencial);
  }

  abrirRegistro() {
    this.modoEdicion = false;
    this.resetForm();
    this.mostrarModal = true;
  }

  abrirEdicion(u: any) {
    this.modoEdicion = true;
    this.usuarioForm = { ...u };
    // Asegurar que roles sea un array (backend devuelve Set/List, aquí llega como array JSON)
    if (!this.usuarioForm.roles) {
      this.usuarioForm.roles = this.usuarioForm.rol ? [this.usuarioForm.rol] : [];
    }
    this.mostrarModal = true;
  }

  toggleRol(rol: string) {
    const roles = this.usuarioForm.roles || [];
    const index = roles.indexOf(rol);
    if (index > -1) {
      roles.splice(index, 1);
    } else {
      roles.push(rol);
    }
    this.usuarioForm.roles = roles;
  }

  resetForm() {
    this.usuarioForm = {
      id: null, nombreCompleto: '', dni: '', telefono: '', direccion: '',
      correoElectronico: '', usuario: '', contrasena: '', roles: [], // 🔹 Reset roles []
      nroRegistro: '', nroColegiatura: '', nroEspecializacion: '', estado: 'ACTIVO'
    };
  }

  guardar() {
    if (!this.esFormularioValido()) {
      alert("⚠️ Error: Verifique que el Celular tenga 9 dígitos (empieza con 9) y el DNI 8 dígitos.");
      return;
    }

    const peticion = this.modoEdicion
      ? this.usuarioService.actualizarUsuario(this.usuarioForm.id, this.usuarioForm)
      : this.usuarioService.registrarUsuario(this.usuarioForm);

    peticion.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarUsuarios();
        alert(this.modoEdicion ? "✅ Datos actualizados" : "✅ Personal registrado");
      },
      error: (err) => alert("❌ Error: " + err.message)
    });
  }

  eliminarUsuario(id: number, nombre: string) {
    if (confirm(`¿Eliminar permanentemente a ${nombre}?`)) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  toggleBloqueo(u: any) {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'desbloquear' : 'bloquear';

    if (confirm(`¿Seguro que deseas ${accion} el acceso de ${u.nombreCompleto}?`)) {
      const usuarioActualizado = { ...u, estado: nuevoEstado };
      this.usuarioService.actualizarUsuario(u.id, usuarioActualizado).subscribe({
        next: () => {
          this.cargarUsuarios();
          alert(`Usuario ${nuevoEstado === 'ACTIVO' ? 'ACTIVADO' : 'SUSPENDIDO'} correctamente.`);
        },
        error: (err) => alert("Error al cambiar estado")
      });
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}