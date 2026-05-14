import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { apiGatewayInterceptor } from './core/interceptors/api-gateway.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([apiGatewayInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
  ]
};
