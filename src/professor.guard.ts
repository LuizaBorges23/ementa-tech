import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const professorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isProfessor()) {
    return true;
  }

  alert('Acesso negado! Apenas professores podem acessar esta área.');
  router.navigate(['/login']);
  return false;
};
