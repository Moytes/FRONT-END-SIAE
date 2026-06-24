import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  UserRole
} from '../core/models/api-models';

export type PermissionKey =
  | 'GESTION_ZONA'
  | 'GESTION_TRABAJO_SOCIAL'
  | 'GESTION_ACTIVIDADES'
  | 'APLICACION'
  | 'ANALISIS_IA'
  | 'PLAN_ACCION'
  | 'PSICOLOGIA'
  | 'APRENDIZAJE'
  | 'COMUNICACION'
  | 'REPORTES'
  | 'LECTURA_ALUMNO'
  | 'GESTION_GRUPOS'
  | 'GESTION_ESCUELAS'
  | 'ADMIN'
  | 'PORTAL_ALUMNO';

// Map backend roles → frontend permission keys
function rolesPermissions(role: UserRole): PermissionKey[] {
  switch (role) {
    case UserRole.ADMIN:
      return ['ADMIN'];
    case UserRole.SUPERVISOR:
      return ['GESTION_ZONA'];
    case UserRole.DIRECTOR_USAER:
      return ['GESTION_ACTIVIDADES', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION', 'GESTION_GRUPOS', 'GESTION_ESCUELAS'];
    case UserRole.ESPECIALISTA_COM:
      return ['COMUNICACION', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION'];
    case UserRole.ESPECIALISTA_PSI:
      return ['PSICOLOGIA', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION'];
    case UserRole.ESPECIALISTA_APR:
      return ['APRENDIZAJE', 'GESTION_ACTIVIDADES', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION'];
    case UserRole.TRABAJO_SOCIAL:
      return ['GESTION_TRABAJO_SOCIAL'];
    case UserRole.DOCENTE:
      return ['APLICACION', 'LECTURA_ALUMNO'];
    case UserRole.TUTOR:
      return ['PORTAL_ALUMNO'];
    case UserRole.ALUMNO:
      return ['PORTAL_ALUMNO'];
    default:
      return ['APLICACION'];
  }
}

const TOKEN_KEY = 'SIAE_JWT_TOKEN';
const SESSION_KEY = 'SIAE_USER_SESSION';

function normalizeRole(role: UserRole | string | number): UserRole {
  return Number(role) as UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<CurrentUser | null>(null);
  private permissionsSignal = signal<PermissionKey[]>([]);

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        const user: CurrentUser = JSON.parse(stored);
        user.role = normalizeRole(user.role);
        if (!user.role || isNaN(user.role) || user.role < 1 || user.role > 10) {
          this.clearSession();
          return;
        }
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
      } else if (!token) {
        this.clearSession();
      }
    } catch (e) {
      console.error('Error leyendo sesión:', e);
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.permissionsSignal.set([]);
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get permissions() {
    return this.permissionsSignal.asReadonly();
  }

  /** Real login against POST /api/auth/login */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const body: LoginRequest = { email, password };
      const res = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponse>>('api/auth/login', body)
      );

      if (res.statusCode === 200 && res.data) {
        const { token } = res.data;
        localStorage.setItem(TOKEN_KEY, token);

        // Fetch full user profile
        await this.loadMe();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
  }

  /** Load current user from GET /api/auth/me */
  async loadMe(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<CurrentUser>>('api/auth/me')
      );
      if (res.statusCode === 200 && res.data) {
        const raw = res.data as any;
        const user: CurrentUser = {
          ...raw,
          role: normalizeRole(raw.roleId ?? raw.role),
          phoneNumber: raw.phone ?? raw.phoneNumber,
          status: raw.activo ? 1 : 0
        };
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
    } catch (err) {
      console.error('loadMe error:', err);
    }
  }

  /** Logout — calls backend and clears local storage */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<any>>('api/auth/logout', {})
      );
    } catch { /* ignore */ } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      this.currentUserSignal.set(null);
      this.permissionsSignal.set([]);
    }
  }

  hasPermission(permission: PermissionKey): boolean {
    return this.permissionsSignal().includes(permission);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSignal() && !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRoleName(): string {
    const user = this.currentUserSignal();
    if (!user) return '';
    const role = normalizeRole(user.role);
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.SUPERVISOR]: 'Supervisor de Zona',
      [UserRole.DIRECTOR_USAER]: 'Director USAER',
      [UserRole.ESPECIALISTA_COM]: 'Especialista en Comunicación',
      [UserRole.ESPECIALISTA_PSI]: 'Especialista en Psicología',
      [UserRole.ESPECIALISTA_APR]: 'Especialista en Aprendizaje',
      [UserRole.TRABAJO_SOCIAL]: 'Trabajo Social',
      [UserRole.DOCENTE]: 'Docente',
      [UserRole.TUTOR]: 'Tutor',
      [UserRole.ALUMNO]: 'Alumno'
    };
    return roleNames[role] ?? 'Usuario';
  }

  getDefaultRoute(): string {
    const user = this.currentUserSignal();
    if (!user) return '/login';

    switch (normalizeRole(user.role)) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.SUPERVISOR:
        return '/supervisordezona';
      case UserRole.DIRECTOR_USAER:
        return '/especialista';
      case UserRole.ESPECIALISTA_COM:
        return '/comunicacion';
      case UserRole.ESPECIALISTA_PSI:
        return '/psicologia';
      case UserRole.ESPECIALISTA_APR:
        return '/aprendizaje';
      case UserRole.TRABAJO_SOCIAL:
        return '/trabajadorsocial';
      case UserRole.DOCENTE:
        return '/docente';
      case UserRole.TUTOR:
        return '/alumno';
      case UserRole.ALUMNO:
        return '/alumno';
      default:
        return '/login';
    }
  }
}
