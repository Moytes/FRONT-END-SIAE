import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login').then(m => m.Login),
    },
    {
        path: '',
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
                path: 'admin',
                data: { permission: 'ADMIN' },
                loadComponent: () =>
                    import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
            },
            {
                path: 'docente',
                canActivate: [roleGuard],
                data: { permission: 'APLICACION' },
                loadComponent: () =>
                    import('./pages/docente-dashboard/docente-dashboard').then(m => m.DocenteDashboard)
            },
            {
                path: 'especialista',
                canActivate: [roleGuard],
                data: { permission: 'PLAN_ACCION' },
                loadComponent: () =>
                    import('./pages/especialista-dashboard/especialista-dashboard').then(m => m.EspecialistaDashboard)
            },
            {
                path: 'perfil',
                loadComponent: () =>
                    import('./pages/perfil/perfil').then(m => m.Perfil)
            },
            {
                path: 'actividades/builder',
                canActivate: [roleGuard],
                data: { permission: 'GESTION_ACTIVIDADES' },
                loadComponent: () =>
                    import('./features/activities/activity-builder/activity-builder.component').then(m => m.ActivityBuilderComponent)
            },
            {
                path: 'actividades/engine/:id',
                canActivate: [roleGuard],
                data: { permission: 'APLICACION' },
                loadComponent: () =>
                    import('./features/activities/activity-engine/activity-engine.component').then(m => m.ActivityEngineComponent)
            },
            {
                path: 'reportes',
                canActivate: [roleGuard],
                data: { permission: 'REPORTES' },
                loadComponent: () =>
                    import('./pages/reportes/reportes').then(m => m.Reportes)
            },
            {
                path: 'reportes-especialista',
                canActivate: [roleGuard],
                data: { permission: 'PLAN_ACCION' },
                loadComponent: () =>
                    import('./pages/specialist-reports-mockup/specialist-reports-mockup').then(m => m.SpecialistReportsMockup)
            },
            {
                path: 'gestion-personal',
                canActivate: [authGuard, roleGuard],
                data: { roles: [1] },
                loadComponent: () =>
                    import('./pages/gestion-personal/gestion-personal').then(m => m.GestionPersonal)
            },
            {
                path: 'gestion-user',
                canActivate: [roleGuard],
                data: { permission: 'LECTURA_ALUMNO' },
                loadComponent: () =>
                    import('./pages/gestion-user/gestion-user').then(m => m.GestionUser)
            },
            {
                path: 'gestion-grupos',
                canActivate: [roleGuard],
                data: { permission: 'GESTION_GRUPOS' },
                loadComponent: () =>
                    import('./pages/gestion-grupos/gestion-grupos').then(m => m.GestionGrupos)
            },
            {
                path: 'gestion-escuelas',
                canActivate: [roleGuard],
                data: { permission: 'GESTION_ESCUELAS' },
                loadComponent: () =>
                    import('./pages/gestion-escuelas/gestion-escuelas').then(m => m.GestionEscuelas)
            },
            {
                path: 'lecciones',
                canActivate: [roleGuard],
                data: { permission: 'LECTURA_ALUMNO' },
                loadComponent: () =>
                    import('./pages/lecciones/lecciones').then(m => m.Lecciones)
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
