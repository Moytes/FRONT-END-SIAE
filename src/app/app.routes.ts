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
            },
            {
                path: 'actividades/builder',
                loadComponent: () =>
                    import('./features/activities/activity-builder/activity-builder.component').then(m => m.ActivityBuilderComponent)
            },
            {
                path: 'actividades/engine/:id',
                loadComponent: () =>
                    import('./features/activities/activity-engine/activity-engine.component').then(m => m.ActivityEngineComponent)
            }
        ]
    },
    {
        path: 'jugar/:id',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/student-game-engine/student-game-engine').then(m => m.StudentGameEngineComponent)
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];
