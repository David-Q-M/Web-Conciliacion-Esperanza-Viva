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
    // 🛡️ Soporte para múltiples roles (Backend devuelve 'roles': [])
    const rolesUsuario = user.roles || (user.rol ? [user.rol] : []);

    // Normalizamos a mayúsculas
    const rolesUpper = rolesUsuario.map((r: string) => r.toUpperCase());

    // Si el usuario tiene AL MENOS UNO de los roles permitidos, adelante
    const tienePermiso = rolesPermitidos.some(r => rolesUpper.includes(r));

    if (tienePermiso) {
      return true;
    }

    // SI NO TIENE EL ROL, lo mandamos a su panel correspondiente (Prioridad según rol)
    console.warn(`Acceso restringido. Roles: ${rolesUpper}`);

    if (rolesUpper.includes('ADMINISTRADOR')) {
      router.navigate(['/admin-dashboard']);
    } else if (rolesUpper.includes('DIRECTOR')) {
      router.navigate(['/director/bandeja-solicitudes']);
    } else if (rolesUpper.includes('CONCILIADOR')) {
      router.navigate(['/conciliador/mis-casos']);
    } else if (rolesUpper.includes('ABOGADO')) {
      // Asumiendo que existe, si no, redirigir a login
      router.navigate(['/abogado/bandeja-pendientes']);
    } else if (rolesUpper.includes('NOTIFICADOR')) {
      router.navigate(['/notificador/bandeja-notificador']);
    } else {
      router.navigate(['/login-admin']);
    }

    return false;
  };
};