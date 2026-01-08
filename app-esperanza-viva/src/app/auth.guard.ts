import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = (rolesPermitidos: string[]) => {
  return () => {
    const router = inject(Router);
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      console.error("Acceso denegado: No hay sesión activa.");
      router.navigate(['/login-admin']);
      return false;
    }

    const user = JSON.parse(userJson);
    const rolUsuario = user.rol ? user.rol.toUpperCase() : '';

    // Si el usuario tiene el rol necesario, adelante
    if (rolesPermitidos.includes(rolUsuario)) {
      return true;
    } 

    // SI NO TIENE EL ROL, lo mandamos a su panel correspondiente (NO al de admin)
    console.warn(`Acceso restringido. Redirigiendo según rol: ${rolUsuario}`);
    
    if (rolUsuario === 'CONCILIADOR') {
      router.navigate(['/conciliador/mis-casos']);
    } else if (rolUsuario === 'DIRECTOR') {
      router.navigate(['/director/bandeja-solicitudes']);
    } else if (rolUsuario === 'ADMINISTRADOR') {
      router.navigate(['/admin-dashboard']);
    } else {
      router.navigate(['/login-admin']);
    }

    return false;
  };
};