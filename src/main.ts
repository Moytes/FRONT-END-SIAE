import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Limpiar storage de SIAE al iniciar para evitar datos corruptos
localStorage.removeItem('SIAE_JWT_TOKEN');
localStorage.removeItem('SIAE_USER_SESSION');

bootstrapApplication(App, appConfig)
  .then(() => console.log('SIAE: Aplicación iniciada correctamente'))
  .catch((err) => console.error('SIAE: Error en el arranque:', err));
