import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('SIAE_JWT_TOKEN');

  // Clone request and add Authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req.clone();

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid — clear session and redirect to login
        localStorage.removeItem('SIAE_JWT_TOKEN');
        localStorage.removeItem('SIAE_USER_SESSION');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
