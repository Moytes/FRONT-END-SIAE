import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login').then(m => m.Login),
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./pages/home/home').then(m => m.Home),
                pathMatch: 'full'
            },
            {
                path: 'perfil',
                loadComponent: () =>
                    import('./pages/perfil/perfil').then(m => m.Perfil)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];
