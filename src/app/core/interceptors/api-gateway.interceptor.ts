import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-models';

export const apiGatewayInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('SIAE_JWT_TOKEN');

  // 1. Asegurar que la URL apunte al Gateway si es una petición de API
  let apiReq = req;
  if (req.url.startsWith('api/') || req.url.startsWith('/api')) {
    const cleanUrl = req.url.startsWith('/') ? req.url.substring(1) : req.url;
    apiReq = req.clone({
      url: `${environment.apiUrl}/${cleanUrl.replace('api/', '')}`,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  return next(apiReq).pipe(
    map(event => {
      // 2. Interceptar respuestas exitosas para validar el estándar JSchema
      if (event instanceof HttpResponse) {
        let body = event.body as any;
        
        // Si el body es un objeto y tiene intOpCode (ya es ApiResponse)
        if (body && body.intOpCode) {
          console.log(`[Trace] Origin: ${getServiceOrigin(body.intOpCode)} | Code: ${body.intOpCode}`);
        }

        // Si el backend responde con JSON plano sin 'statusCode' (ej. SAEV3), lo envolvemos
        if (body !== null && typeof body === 'object' && !('statusCode' in body)) {
          const wrappedBody: ApiResponse = {
            statusCode: event.status,
            message: 'Success',
            data: body
          };
          return event.clone({ body: wrappedBody });
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // 3. Manejo profesional de errores por capa (Gateway vs Microservicio)
      const errorBody = error.error as ApiResponse;
      const intOpCode = errorBody?.intOpCode || 'UNKNOWN_ERROR';
      const origin = getServiceOrigin(intOpCode);

      console.error(`[Error] Origin: ${origin} | Code: ${intOpCode}`, errorBody);

      if (error.status === 401 && intOpCode === 'ID_401') {
        localStorage.removeItem('SIAE_JWT_TOKEN');
        localStorage.removeItem('SIAE_USER_SESSION');
        router.navigate(['/login']);
      }

      if (error.status === 429 || intOpCode === 'GW_429') {
        alert('Has excedido el límite de peticiones. Por favor, espera un momento.');
      }

      return throwError(() => ({
        ...error,
        origin,
        intOpCode,
        message: errorBody?.data || error.message
      }));
    })
  );
};

// Función auxiliar para identificar el origen del error según el prefijo definido en el TXT
function getServiceOrigin(intOpCode: string): string {
  if (intOpCode.startsWith('GW_')) return 'API Gateway (Infraestructura)';
  if (intOpCode.startsWith('ID_')) return 'Identity Microservice';
  if (intOpCode.startsWith('ST_')) return 'Student Microservice';
  if (intOpCode.startsWith('CL_')) return 'Clinical Microservice';
  return 'Unknown Origin';
}
