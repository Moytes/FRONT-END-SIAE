import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// La limpieza de una sesión corrupta ya la maneja AuthService.loadSession()
// (try/catch + validación de rol) al construirse. Borrar el storage aquí
// incondicionalmente cerraba la sesión del usuario en cada refresco de página.

bootstrapApplication(App, appConfig)
  .then(() => console.log('SIAE: Aplicación iniciada correctamente'))
  .catch((err) => console.error('SIAE: Error en el arranque:', err));
