import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../core/services/api';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  UserRole
} from '../core/models/api-models';

export type PermissionKey =
  | 'GESTION_ACTIVIDADES'
  | 'APLICACION'
  | 'ANALISIS_IA'
  | 'PLAN_ACCION'
  | 'REPORTES'
  | 'LECTURA_ALUMNO'
  | 'ADMIN';

// Map backend roles → frontend permission keys
function rolesPermissions(role: UserRole): PermissionKey[] {
  switch (role) {
    case UserRole.ADMIN:
      return ['GESTION_ACTIVIDADES', 'APLICACION', 'ANALISIS_IA', 'PLAN_ACCION', 'REPORTES', 'LECTURA_ALUMNO', 'ADMIN'];
    case UserRole.SUPERVISOR:
      return ['GESTION_ACTIVIDADES', 'REPORTES', 'LECTURA_ALUMNO', 'ANALISIS_IA'];
    case UserRole.DIRECTOR_USAER:
      return ['GESTION_ACTIVIDADES', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION'];
    case UserRole.ESPECIALISTA_COM:
    case UserRole.ESPECIALISTA_PSI:
    case UserRole.ESPECIALISTA_APR:
    case UserRole.TRABAJO_SOCIAL:
      return ['GESTION_ACTIVIDADES', 'APLICACION', 'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION'];
    case UserRole.DOCENTE:
      return ['APLICACION', 'LECTURA_ALUMNO'];
    default:
      return ['APLICACION'];
  }
}

const TOKEN_KEY = 'SIAE_JWT_TOKEN';
const SESSION_KEY = 'SIAE_USER_SESSION';

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
      if (stored) {
        const user: CurrentUser = JSON.parse(stored);
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
      }
    } catch (e) {
      console.error('Error leyendo sesión:', e);
    }
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
        this.http.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/api/auth/login`, body)
      );

      if (res.statusCode === 200 && res.data.length > 0) {
        const { token } = res.data[0];
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
        this.http.get<ApiResponse<CurrentUser>>(`${API_BASE_URL}/api/auth/me`)
      );
      if (res.statusCode === 200 && res.data.length > 0) {
        const user = res.data[0];
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
        this.http.post<ApiResponse<any>>(`${API_BASE_URL}/api/auth/logout`, {})
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
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.SUPERVISOR]: 'Supervisor de Zona',
      [UserRole.DIRECTOR_USAER]: 'Director USAER',
      [UserRole.ESPECIALISTA_COM]: 'Especialista en Comunicación',
      [UserRole.ESPECIALISTA_PSI]: 'Especialista en Psicología',
      [UserRole.ESPECIALISTA_APR]: 'Especialista en Aprendizaje',
      [UserRole.TRABAJO_SOCIAL]: 'Trabajo Social',
      [UserRole.DOCENTE]: 'Docente'
    };
    return roleNames[user.role] ?? 'Usuario';
  }
}
