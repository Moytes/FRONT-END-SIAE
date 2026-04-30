import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, PermissionKey } from '../../services/auth.service';

/**
 * Guard to check if user has a specific permission.
 * Usage in routes: 
 * { path: 'admin', canActivate: [roleGuard], data: { permission: 'ADMIN' } }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermission = route.data['permission'] as PermissionKey;

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }

  // Redirect to their default route if they don't have permission
  const defaultRoute = authService.getDefaultRoute();
  return router.parseUrl(defaultRoute);
};
