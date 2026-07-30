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
  const requiredRoles = route.data['roles'] as number[] | undefined;

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const currentRole = Number(authService.currentUser()?.role);
    if (!requiredRoles.includes(currentRole)) {
      return router.parseUrl(authService.getDefaultRoute());
    }
  }

  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }

  // Redirect to their default route if they don't have permission
  const defaultRoute = authService.getDefaultRoute();
  return router.parseUrl(defaultRoute);
};
