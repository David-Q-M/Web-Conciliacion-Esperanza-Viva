import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const user = localStorage.getItem('currentUser');

  if (user) {
    return true; // Permite el paso
  } else {
    router.navigate(['/login-admin']); // Lo manda al login si no hay sesión
    return false;
  }
};